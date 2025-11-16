'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Algo deu errado!</h2>
        <p className="text-gray-300 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
