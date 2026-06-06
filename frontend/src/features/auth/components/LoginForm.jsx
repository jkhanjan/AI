import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

const DEMO_EMAIL = "try1@try1.com";
const DEMO_PASSWORD = "try123";

export default function LoginForm() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await handleLogin({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Try the demo account below.");
    }
  };

  return (
    <div className="flex min-h-screen w-[100svw] items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm space-y-4">

        {/* Demo banner */}
        <div className="rounded-[9px] border border-blue-500/30 bg-white-500/10 px-4 py-3 text-sm text-blue-200 space-y-2">
          <p className="font-medium"> Try a demo account</p>
          <div className="text-white-300/80 text-xs space-y-0.5">
            <p>Email: <span className="font-mono text-blue-100">{DEMO_EMAIL}</span></p>
            <p>Password: <span className="font-mono text-blue-100">{DEMO_PASSWORD}</span></p>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="text-xs text-blue-300 underline underline-offset-2 hover:text-blue-100 transition-colors"
          >
            Click to autofill →
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-[9px] text-sm bg-white/[0.08] border border-white/[0.15] text-white/75 hover:bg-white/[0.14] disabled:opacity-40 transition-colors duration-150"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-[9px] text-sm bg-white/[0.08] border border-white/[0.15] text-white/75 hover:bg-white/[0.14] disabled:opacity-40 transition-colors duration-150"
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            className="flex-shrink-0 w-full px-3 py-1.5 rounded-[9px] text-sm bg-white/[0.08] border border-white/[0.15] text-white/75 hover:bg-white/[0.14] disabled:opacity-40 transition-colors duration-150"
          >
            Login
          </Button>

          <Link to="/auth/signin" className="block text-sm text-blue-200 hover:underline">
            Don't have an account? Signup
          </Link>
        </form>
      </div>
    </div>
  );
}