"use client";
import { useState, useEffect } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<{ User_id: number; Username: string }[]>([]);

  const [username, setUsername] = useState("");

  //fetch mn l api 
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  
  const addUser = async () => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      const newUser = await res.json();
      setUsers([...users, newUser]); 
      setUsername(""); 
    }
  };

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
        <button onClick={addUser} className="bg-blue-500 text-white items-center justify-center px-4 py-2 rounded">
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
