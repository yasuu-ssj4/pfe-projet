"use client"

import { useParams } from "next/navigation"
import ConstaterRapport from "../constaterRapport"

export default function ConstaterRapportPage(){
    const params = useParams()
    const id_rapport = params.id as string

    return <ConstaterRapport id_demande_intervention={id_rapport} />
}