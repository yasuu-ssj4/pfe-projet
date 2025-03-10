"use client";
import "./globals.css";
import LoginPage from "./signup-form";
import Header from "./header";

import Image from "next/image";

import buildings from "../../public/industry.png";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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
