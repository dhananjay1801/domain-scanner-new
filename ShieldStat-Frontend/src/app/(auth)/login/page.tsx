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

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-[#fcfcfc] px-4 text-slate-400 font-medium">Authentication Options</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-medium text-slate-700 flex items-center justify-center">
                    <svg className="size-5 mr-3" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M24 12.27c0-.85-.07-1.66-.21-2.43H12v4.61h6.74c-.3 1.57-1.18 2.89-2.49 3.77v3.13h4.03c2.35-2.17 3.72-5.38 3.72-9.08z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-4.03-3.13c-1.11.75-2.54 1.19-3.9 1.19-3.01 0-5.56-2.03-6.47-4.76H1.47v3.23C3.45 21.48 7.42 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.53 14.39c-.24-.73-.38-1.51-.38-2.31s.14-1.58.38-2.31V6.53H1.47C.53 8.16 0 10.02 0 12s.53 3.84 1.47 5.47l4.06-3.08z"
                        />
                        <path
                            fill="#4285F4"
                            d="M12 4.75c1.76 0 3.35.61 4.59 1.79l3.45-3.45C17.94 1.19 15.23 0 12 0 7.42 0 3.45 2.52 1.47 6.53l4.06 3.08c.91-2.73 3.46-4.76 6.47-4.76z"
                        />
                    </svg>
                    Google
                </button>
                <button className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-medium text-slate-700 flex items-center justify-center">
                    <Github className="size-5 mr-3 text-slate-900" />
                    GitHub
                </button>
            </div>

            <p className="mt-12 text-center text-xs text-slate-400 font-light leading-relaxed">
                Protected by enterprise-grade encryption. By continuing, you agree to our <br />
                <Link href="#" className="text-slate-600 hover:text-brand transition-colors underline underline-offset-4 decoration-slate-200">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-slate-600 hover:text-brand transition-colors underline underline-offset-4 decoration-slate-200">Privacy Policy</Link>.
            </p>
        </motion.div>
    )
}
