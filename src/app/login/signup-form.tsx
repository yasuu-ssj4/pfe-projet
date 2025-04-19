"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NextApiRequest, NextApiResponse } from 'next'
import { ErrorNotification } from "./page";
import { signIn, useSession } from "next-auth/react";
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // enregistrer les messages

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); 

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
       
      });
       
      const data = await response.json();
      console.log(data);
      
      if (!response.ok) {
        setErrorMessage(data.error || "Une erreur s'est produite.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="flex items-center p-0 w-[60vw] justify-center min-h-screen bg-[#002866]">
        <ErrorNotification message={errorMessage} />
        <div className=" ml-[500px] bg-[#D3D31B] p-6 rounded-2xl shadow-lg w-96  absolute left-40 top-15 z-20 ">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block font-semibold text-black">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-black">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
            />
          </div>

         

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  
  );
}