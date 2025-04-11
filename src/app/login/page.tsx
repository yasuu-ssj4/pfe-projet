"use client";
import "../globals.css";

import Header from "../header";

import Image from "next/image";

import buildings from "../../../public/industry.png";
import { motion } from "framer-motion";
import LoginPage from "./signup-form";

export function ErrorNotification({ message }: { message: string | null }) {
  if (!message) return null; // Don't render if no error

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {message}
    </motion.div>
  );
}
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-row-reverse flex-grow">
        <LoginPage />
        <div className="shapedividers_com-185 relative w-full">
          {/* Industry Image */}
          
        </div>
        <Image
            src={buildings}
            alt="Industry Buildings"
           className="absolute bottom-0 w-[83%] h-auto z-10 pointer-events-none"
          />
         
      </div>
      
    </div>
  );
}
