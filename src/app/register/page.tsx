'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import Link from "next/link";
import userRegister from "../../libs/userRegister";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
  
      try {
        const data = await userRegister(name, email, phone, password);
        
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        alert("Registration Successful! สมัครสมาชิกสำเร็จ");
        router.push("/");
      } catch (err: any) {
        setError(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <TextField
            required
            variant="standard"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            required
            variant="standard"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            required
            variant="standard"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />

          <TextField
            required
            variant="standard"
            label="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            inputProps={{ minLength: 6 }} 
          />

          <Button
            type="submit"
            variant="contained"
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-none"
            fullWidth
          >
            Register
          </Button>

        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>

    </main>
  );
}