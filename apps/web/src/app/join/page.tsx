"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, CheckCircle2, ChevronRight, UserCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"

type Step = "code" | "role"

const roles = [
    { id: "SOPRANO", name: "Soprano", color: "from-pink-500 to-rose-500" },
    { id: "ALTO", name: "Contralto", color: "from-purple-500 to-fuchsia-500" },
    { id: "TENOR", name: "Tenor", color: "from-blue-500 to-cyan-500" },
    { id: "BASS", name: "Bajo", color: "from-emerald-500 to-teal-500" }
]

export default function JoinPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlCode = searchParams.get("code")

    const [step, setStep] = useState<Step>("code")
    const [code, setCode] = useState(urlCode || "")
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [choirName, setChoirName] = useState("")

    useEffect(() => {
        if (urlCode) {
            handleVerifyCode(null, urlCode)
        }
    }, [urlCode])

    const handleVerifyCode = async (e: React.FormEvent | null, codeToVerify?: string) => {
        if (e) e.preventDefault()
        const finalCode = codeToVerify || code
        if (!finalCode) return

        setIsLoading(true)
        setError("")
        try {
            const data = await fetchApi(`/invites/validate/${finalCode.toUpperCase()}`)
            if (data.valid) {
                setChoirName(data.choir_name)
                setCode(finalCode.toUpperCase())
                setStep("role")
            } else {
                setError(data.message || "Código no válido")
            }
        } catch (err) {
            setError("Error al verificar el código")
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoin = async () => {
        if (!selectedRole || !code) return
        setIsLoading(true)
        setError("")
        try {
            // In a full implementation, this might call a registration or join endpoint
            // For now, redirecting to dashboard as requested by the initial mockup
            window.location.href = "/projects"
        } catch (err) {
            setError("Error al unirse al coro")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050511] flex flex-col p-4 md:p-8 font-sans">

            {/* Premium ambient light */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-xl mx-auto">
                <AnimatePresence mode="popLayout">

                    {step === "code" && (
                        <motion.div
                            key="step-code"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 shadow-2xl mb-6">
                                    <Sparkles className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Únete a tu coro</h1>
                                <p className="text-slate-400">Introduce el código de invitación que te proporcionó el director.</p>
                            </div>

                            <form onSubmit={(e) => handleVerifyCode(e)} className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        required
                                        maxLength={12}
                                        value={code.toUpperCase()}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-2xl px-6 py-5 text-center text-3xl font-mono text-white tracking-[0.2em] placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase"
                                        placeholder="CÓDIGO"
                                    />
                                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/20 p-4 rounded-xl"
                                    >
                                        <AlertCircle size={18} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={code.length < 4 || isLoading}
                                    className="w-full bg-white text-black font-semibold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/10"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Verificar Código"}
                                    {!isLoading && <ChevronRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === "role" && (
                        <motion.div
                            key="step-role"
                            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            className="w-full"
                        >
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                                    <CheckCircle2 size={14} /> Código Aceptado
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-2">{choirName}</h2>
                                <p className="text-slate-400">¿Qué cuerda cantas en este coro?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRole(r.id)}
                                        className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${selectedRole === r.id
                                            ? 'bg-white/10 border-white/20 ring-2 ring-white/30 scale-[1.02]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 border'
                                            }`}
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${r.color} opacity-20 blur-2xl rounded-full transform translate-x-1/2 -translate-y-1/2`} />

                                        <div className="flex flex-col gap-4 relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === r.id ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                                                <UserCircle className="w-6 h-6" />
                                            </div>
                                            <span className="font-semibold text-lg text-white">{r.name}</span>
                                        </div>

                                        {selectedRole === r.id && (
                                            <motion.div layoutId="check" className="absolute top-4 right-4 text-white">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={!selectedRole || isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar y Entrar"}
                            </button>

                            <button
                                onClick={() => setStep("code")}
                                className="w-full mt-6 text-slate-500 text-sm font-medium hover:text-white transition-colors"
                            >
                                Utilizar otro código
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
