'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Logo({className, type="theme"}: {className?: string, type?: "theme" | "light" | "dark" | "favicon"}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const src = ((type == "theme" && resolvedTheme == "light") || type == "light")
        ? "/LogoLight.png"
        : ((type == "theme" && resolvedTheme == "dark") || type == "dark")
            ? "/LogoDark.png"
            : "/favicon.ico";

    const size = type === "favicon" ? 32 : 96;

    return (type == "theme" ? mounted : true) && (
        <Image src={src} alt="Mesa AI Logo" className={className} width={size} height={size} priority={type !== "favicon"} />
    );
}