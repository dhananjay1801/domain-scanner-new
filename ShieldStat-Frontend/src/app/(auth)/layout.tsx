"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useSidebar } from "@/context/SidebarContext"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { setHideSidebar } = useSidebar()

    useEffect(() => {
        setHideSidebar(true)
        return () => setHideSidebar(false)
    }, [setHideSidebar])

    return (
        <div className="flex h-screen w-full bg-[#fcfcfc]">
            {/* Left side: Security UI / Image - fixed, never scrolls */}
            <div className="relative hidden md:flex md:w-1/2 lg:w-[48%] bg-[#0A0C10] shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/auth-bg.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0C10] via-[#0A0C10]/80 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)]" />

                <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 lg:p-12">
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                        <Image
                            src="/logo_isecurify.svg"
                            alt="ShieldStat"
                            width={160}
                            height={48}
                            className="brightness-0 invert h-8 w-auto"
                            priority
                        />
                    </Link>

                    <div className="max-w-md">
                        <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4 leading-tight tracking-tight">
                            Autonomous security for the <span className="text-brand">modern enterprise.</span>
                        </h2>
                        <p className="text-slate-400 text-base lg:text-lg leading-relaxed font-light">
                            Deploy intelligent agents that scan, detect, and defend your infrastructure around the clock.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                        <span className="hover:text-slate-300 cursor-default transition-colors">© 2026 ShieldStat Inc.</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Security Standards</Link>
                    </div>
                </div>

                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand/5 blur-[80px] rounded-full" />
                <div className="absolute top-1/4 -right-10 w-48 h-48 bg-brand/10 blur-[60px] rounded-full" />
            </div>

            {/* Right side: Auth forms - scrollable independently */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
                    <div className="w-full max-w-[420px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
