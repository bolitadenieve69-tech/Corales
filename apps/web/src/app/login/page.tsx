"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Music, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { login } from "@/lib/api"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await login(email, password);
            window.location.href = "/";
        } catch (err: any) {
            setLoading(false);
            setError(err.message || "Email o contraseña incorrectos");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4 font-sans text-neutral-900">

            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-gold/5 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white border border-neutral-200/50 rounded-3xl p-8 shadow-2xl shadow-primary-900/5"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
                        <Music className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 font-display tracking-tight">Acceso Coral</h1>
                    <p className="text-neutral-600 mt-2 text-sm font-ui">Gestiona e interpreta tu repertorio</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-primary-900 pl-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            placeholder="director@coro.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center pl-1 pr-1">
                            <label className="text-sm font-bold text-primary-900">Contraseña</label>
                            <a href="#" className="text-xs text-primary-500 hover:text-primary-800 font-bold transition-colors">¿Olvidaste tu contraseña?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary-500 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-8 bg-primary-500 hover:bg-primary-800 rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-70"
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

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-600 font-medium">
                        ¿Eres coralista? <a href="/join" className="text-primary-500 hover:text-primary-800 font-bold transition-colors">Usa tu código de invitación</a>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
