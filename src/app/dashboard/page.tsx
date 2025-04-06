"use client";
import { useState, useEffect } from "react";
import { redirect } from 'next/navigation';
import { cookies } from "next/dist/server/request/cookies";
import React from "react";

export default  function UsersPage() {
  const [users, setUsers] = useState<{ User_id: number; Username: string }[]>([]);

  const [username, setUsername] = useState("");
  const getSessionId = async () => {
    const session = (await cookies()).get('session_id');
    console.log(session); 
   if (!session) {
      redirect('../'); 
    }
    return session;
  };

  React.useEffect(() => {
    getSessionId(); 
  }, []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="mt-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="border p-2 mr-2 items-center justify-center"
        />
        <button  className="bg-blue-500 text-white items-center justify-center px-4 py-2 rounded">
          Add User
        </button>
      </div>

      <ul className="mt-4">
        {users.map((user: any) => (
          <li key={user.User_id} className="border p-2 my-2 items-center justify-center">
            {user.Username}
          </li>
        ))}
      </ul>
    </div>
  );
}
