"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Music, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Simulate API call for presentation
        setTimeout(() => {
            setLoading(false)
            window.location.href = "/projects" // Assuming Director goes to projects or catalog
        }, 1500)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1c] to-[#0a0f1c] p-4 font-sans text-slate-200">

            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                        <Music className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Acceso Coral</h1>
                    <p className="text-slate-400 mt-2 text-sm">Gestiona e interpreta tu repertorio</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300 pl-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="director@coro.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center pl-1 pr-1">
                            <label className="text-sm font-medium text-slate-300">Contraseña</label>
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">¿Olvidaste tu contraseña?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 font-medium text-white shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 transition-all disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Iniciar Sesión</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-400">
                        ¿Eres coralista? <a href="/join" className="text-white hover:text-blue-400 font-medium transition-colors">Usa tu código de invitación</a>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
