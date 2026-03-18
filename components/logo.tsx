'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo({className, type="theme"}: {className?: string, type?: "theme" | "light" | "dark" | "favicon"}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (type =="theme" ? mounted : true) && <img src={((type == "theme" && resolvedTheme == "light") || type =="light") ? "/LogoLight.png" : ((type=="theme" && resolvedTheme == "dark") || type =='dark') ? "/LogoDark.png" : "/favicon.ico"} alt="Mesa AI Logo" className={className} suppressHydrationWarning/>;
}