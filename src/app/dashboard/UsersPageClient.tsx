
"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getUserFromToken } from "./auth";
import Sidebar from "./sideBar";
type Props = {
  userId: number;
};

export default function UsersPage({ userId }: Props) {
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    console.log("User ID:", userId); 
  }, [userId]);

  return (
    <div className="p-6">
      <div className="flex flex-1 pt-[12vh] h-lvh ">
           <Sidebar/>
</div>
      <h1 className="text-2xl font-bold">Welcome, user #{userId}</h1>

      <div className="mt-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="border p-2 mr-2"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </div>
    </div>
  );
}
