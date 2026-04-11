"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            await login(email, password)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed. Please try again."
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
        >
            <div className="flex items-center justify-between mb-12">
                <Link href="/" className="md:hidden">
                    <Image
                        src="/logo_isecurify.svg"
                        alt="ShieldStat"
                        width={120}
                        height={32}
                        className="h-7 w-auto"
                    />
                </Link>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500 font-light">Need an account?</span>
                    <Link href="/signup" className="text-brand font-semibold hover:opacity-80 transition-colors">
                        Create one
                    </Link>
                </div>
            </div>

            <div className="mb-10">
                <h1 className="text-4xl font-semibold text-slate-900 mb-3 tracking-tight">Welcome back</h1>
                <p className="text-slate-500 text-lg font-light">Access your autonomous security dashboard.</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                >
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2.5">
                    <label className="text-sm font-medium text-slate-600 ml-0.5">Work Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Mail className="size-4.5 text-slate-400 group-focus-within:text-brand transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all text-slate-900 placeholder:text-slate-400 font-light"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between ml-0.5">
                        <label className="text-sm font-medium text-slate-600">Password</label>
                        <Link href="#" className="text-xs font-medium text-brand hover:opacity-80 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Lock className="size-4.5 text-slate-400 group-focus-within:text-brand transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-12 pl-12 pr-12 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all text-slate-900 placeholder:text-slate-400 font-light"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-brand hover:bg-brand/90 shadow-md shadow-brand/10 text-white font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[0px] text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 size-4.5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Continue to Dashboard
                            <ArrowRight className="ml-2 size-4.5" />
                        </>
                    )}
                </button>
            </form>

        </motion.div>
    )
}
