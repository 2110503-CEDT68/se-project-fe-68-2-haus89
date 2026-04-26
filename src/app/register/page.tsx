'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import Link from "next/link";
import userRegister from "../../libs/userRegister";
import getMe from "../../libs/getMe";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get("redirect"); 
    
    if (urlValue) {
      setRedirectUrl(urlValue);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
  
      try {
        const data = await userRegister(name, email, phone, password);
        
        if (data.token) {
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
        }
        
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          alert("Registration Successful!");
          router.push("/");
        }
      } catch (err: any) {
        setError(err.message || "Unable to connect to server");
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

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy-policy"
              required
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
            />
            <label htmlFor="privacy-policy" className="text-sm text-gray-600 leading-snug">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowPolicy(true)}
                className="text-blue-600 font-medium underline hover:text-blue-800"
              >
                Privacy Policy
              </button>{" "}
              and consent to the collection and use of my personal data for dental appointment services.
            </label>
          </div>

          <Button
            type="submit"
            variant="contained"
            disabled={!agreedToPolicy}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-none disabled:opacity-50"
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

      {showPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Privacy Policy</h2>
              <button
                onClick={() => setShowPolicy(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
              <p><strong>Last updated:</strong> April 2026</p>
              <p>By registering, you agree to the collection and use of your personal information as described below.</p>
              <h3 className="font-semibold text-gray-800">1. Information We Collect</h3>
              <p>We collect your name, email address, and phone number to create and manage your account and dental appointments.</p>
              <h3 className="font-semibold text-gray-800">2. How We Use Your Data</h3>
              <p>Your data is used solely for scheduling dental appointments, sending reminders, and managing your records within this platform.</p>
              <h3 className="font-semibold text-gray-800">3. Data Sharing</h3>
              <p>We do not sell or share your personal data with third parties except as required to operate the service (e.g., your assigned dentist).</p>
              <h3 className="font-semibold text-gray-800">4. Data Retention</h3>
              <p>Your data is retained for as long as your account is active. You may request deletion at any time by contacting support.</p>
              <h3 className="font-semibold text-gray-800">5. Your Rights</h3>
              <p>You have the right to access, correct, or delete your personal data. Contact us at support@realhaus89.com for any requests.</p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowPolicy(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}