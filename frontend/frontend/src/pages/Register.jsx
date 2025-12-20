import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    login(data);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Register</h1>
        <input className="w-full border p-2" placeholder="Name" onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border p-2" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
}
