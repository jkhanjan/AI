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
      console.log(res);
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    // The wrapper div takes up the full height of the viewport and centers its content
    <div className="flex min-h-screen w-[100svw] items-center justify-center px-4">
      <form 
        onSubmit={onSubmit} 
        className="w-full max-w-sm space-y-4"
      >
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full border-1 border-primary">
          Login
        </Button>
      <Link to="/auth/signin" className="text-sm text-primary">
        Don't have an account? Signup
      </Link>
      </form>
    </div>
  );
}