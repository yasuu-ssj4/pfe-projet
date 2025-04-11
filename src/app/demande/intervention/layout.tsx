 
"use client";  
import Header from "@/app/header";
import { FormProvider } from "../components/FormContext";  

import { ReactNode } from "react";

export default function InterventionLayout({ children }: { children: ReactNode }) {
  return (
    <FormProvider>
      {/* Appliquer le fond jaune ici pour toutes les pages du formulaire */}
      <div className="min-h-screen bg-yellow-50">{children}</div>
    </FormProvider>
  );
}
