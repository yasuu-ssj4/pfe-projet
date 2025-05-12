"use client"

import { useParams } from "next/navigation"
import ConstaterDemande from "../constaterDemande"

export default function ConstaterDemandePage() {
  const params = useParams()
  const id_demande = params.id as string

  return <ConstaterDemande id_demande_intervention={id_demande} />
}