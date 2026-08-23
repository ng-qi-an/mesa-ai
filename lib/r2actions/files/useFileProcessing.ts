// hooks/use-file-processing.ts
"use client";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useEffect, useRef, useState } from "react";

const IN_PROGRESS_STATUSES = new Set(["extracting", "chunking", "embedding", "summarising"]);

export function useFileProcessing(fileId: string, initialStatus: string, contentType: string, onStatusChange?: (status: string) => void) {
    const [status, setStatus] = useState(initialStatus);
    const abortRef = useRef<AbortController | null>(null);

    function connect(url: string, method: "GET" | "POST") {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        fetchEventSource(url, {
            method,
            signal: ctrl.signal,
            openWhenHidden: true,
            onmessage(ev) {
                const msg = JSON.parse(ev.data);
                setStatus(msg.status);
                onStatusChange?.(msg.status);
            },
            onerror(err) {
                console.error("stream error", err);
            },
        });
    }

    function start() {
        connect(`/api/files/${fileId}/process`, "POST");
    }

    useEffect(() => {
        if (IN_PROGRESS_STATUSES.has(initialStatus) && contentType !== "application/x-directory") {
            connect(`/api/files/${fileId}/resumeStream`, "GET");
        }
        return () => abortRef.current?.abort();
    }, []);

    return { status, start };
}