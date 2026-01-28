'use client';
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../app/firebase";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Registration successful! You are logged in.");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Login successful!");
            }
        } catch (err: any) {
            setError(err.message);
        }
};
    return (
        <div className="flex flex-col gap-4 p-6 border border-zinc-700 rounded-xl bg-zinc-900 text-white max-w-sm mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center">{isRegistering ? "Sign up" : "Login"}</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-orange-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-orange-500"
                />
                <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {isRegistering ? "Sign up" : "Login"}
                </button>
            </form>
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-zinc-400 hover:text-zinc-200 mt-2"
            >
                {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </button>
        </div>
    )
}