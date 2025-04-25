import { redirect } from "next/navigation"
import { getUserFromToken } from "@/app/dashboard/auth"
import FormRapport from "./rapport"

export default async function RapportPage({
  searchParams,
}: {
  searchParams: { id_demande?: string }
}) {
  const user = await getUserFromToken()

  if (!user) redirect("/login")

  const { id_demande } = searchParams

  if (!id_demande) {
    redirect("/vehicule")
  }

  return (
    <div className="bg-[#dcdfe8]">
      <div className="flex flex-1 pt-[12vh] h-lvh">
        <main className="w-full h-full flex-1">
          <div className="flex justify-end">
            <FormRapport id_demande_intervention={id_demande} />
          </div>
        </main>
      </div>
    </div>
  )
}
