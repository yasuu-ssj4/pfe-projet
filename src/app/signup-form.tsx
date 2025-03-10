"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [AuthType, setAuthType] = useState("BDD");
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex items-center p-0 w-[60vw] justify-center min-h-screen bg-[#002866]">
      <div className=" ml-[500px] bg-[#D3D31B] p-6 rounded-2xl shadow-lg w-96  absolute left-40 top-15 z-20 ">
        {/*le login*/ }
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4"> 

          <div>
            {/*le username*/ }
            <label htmlFor="email" className="block font-semibold bg-text-sm font-medium text-black">
              Username
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nom prenom"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold font-medium text-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mot de passe"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-black"
            />
          </div>

          <div className="flex justify-between items-center">

            <span className="text-sm font-medium font-semibold text-black">Type d'authentification:</span>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 ">
                <input
                  type="radio"
                  name="userType"
                  value="user"
                  checked={AuthType === "BDD"}
                  onChange={() => setAuthType("BDD")}
                  className=" peer hidden "
                />
                <div className="w-[15px] h-[15px] border-2 border-[#222] bg-[#eee] hover:bg-[#ccc] rounded-full peer-checked:bg-blue-600"></div>
                <span className="text-gray-900">BDD</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={AuthType === "AD"}
                  onChange={() => setAuthType("AD")}
                  className=" peer hidden"
                />
                <div className="w-[15px] h-[15px] border-2 border-[#222] bg-[#eee] hover:bg-[#ccc] rounded-full peer-checked:bg-blue-600"></div>
                <span className="text-gray-900">AD</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300"
            disabled={loading}
          >
            {loading ? "connexion... " : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  
  );
}
