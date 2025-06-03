"user client";
import { useRouter } from "next/navigation";
import { X,Ban } from "lucide-react";
export default function NoRapport(){
    const router = useRouter();
    return(
        <div className="fixed  flex items-center justify-center py-48 px-96">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="justify-items-center justify-center h-24">
            <h2 className="text-xl font-semibold text-gray-800">Desolé ! vous n'avez pas le droit</h2>
          <Ban size={40} className="text-red-500"/>
            
         
        </div>
      </div>
    </div>
    )
}