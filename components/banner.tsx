'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Banner({className, type="theme"}: {className?: string, type?: "theme" | "light" | "dark"}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (type =="theme" ? mounted : true) && <img src={((type == "theme" && resolvedTheme == "light") || type =="light") ? "/BannerLight.png" : "/BannerDark.png"} alt="Mesa AI Logo" className={className} suppressHydrationWarning/>;
}