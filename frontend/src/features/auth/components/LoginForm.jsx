import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await handleLogin({ email, password });
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen w-[100svw] items-center justify-center px-4 bg-black">
      <form 
        onSubmit={onSubmit} 
        className="w-full max-w-sm space-y-4"
      >
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
           className="
            flex-shrink-0 px-3 py-1.5 rounded-[9px] text-sm
            bg-white/[0.08] border border-white/[0.15] text-white/75
            hover:bg-white/[0.14] disabled:opacity-40
            transition-colors duration-150
          "
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
           className="
            flex-shrink-0 px-3 py-1.5 rounded-[9px] text-sm
            bg-white/[0.08] border border-white/[0.15] text-white/75
            hover:bg-white/[0.14] disabled:opacity-40
            transition-colors duration-150
          "
        />

        <Button type="submit"  
        className="
            flex-shrink-0 w-full px-3 py-1.5 rounded-[9px] text-sm
            bg-white/[0.08] border border-white/[0.15] text-white/75
            hover:bg-white/[0.14] disabled:opacity-40
            transition-colors duration-150
          ">
          Login
        </Button>
      <Link to="/auth/signin" className="text-sm text-primary text-blue-200 hover:underline">
        Don't have an account? Signup
      </Link>
      </form>
    </div>
  );
}