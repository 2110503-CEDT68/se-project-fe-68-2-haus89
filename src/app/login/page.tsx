'use client'

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, Button } from "@mui/material";
import Link from "next/link";
import userLogin from "../../libs/userLogin"; 
import getMe from "../../libs/getMe";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
  
      try {
        const data = await userLogin(email, password);
        
        localStorage.setItem("token", data.token);

        // Fetch user info to get role
        try {
          const meData = await getMe(data.token);
          const role = meData.data?.role || meData.role || 'user';
          localStorage.setItem("role", role);
        } catch {
          localStorage.setItem("role", "user");
        }
        
        window.dispatchEvent(new Event('authChange'));
        
        const redirectUrl = searchParams.get("redirect");
        
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          alert("Login Successful! เข้าสู่ระบบสำเร็จ");
          router.push("/");
        }
      } catch (err: any) {
        setError(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
          Sign In
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-none"
            fullWidth
          >
            Login
          </Button>

        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>

    </main>
  );
}