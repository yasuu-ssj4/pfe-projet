import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#0a2d5e]" />
        <p className="mt-4 text-lg text-gray-600">Chargement des données d&apos;immobilisation...</p>
      </div>
    </div>
  )
}
