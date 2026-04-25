'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Banner({className, type="theme"}: {className?: string, type?: "theme" | "light" | "dark"}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const src = ((type == "theme" && resolvedTheme == "light") || type == "light")
        ? "/BannerLight.png"
        : "/BannerDark.png";

    return (type == "theme" ? mounted : true) && (
        <Image src={src} alt="Mesa AI Logo" className={className} width={1200} height={320} priority={type !== "dark"} />
    );
}