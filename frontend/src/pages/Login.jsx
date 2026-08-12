import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx"; 
import {toast} from "sonner"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; 
import { AuthShell } from "../components/AuthShell.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
     <AuthShell
      title="Log in"
      subtitle="Continue to your rooms"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-9 bg-background text-[13px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[11px] uppercase tracking-wider  text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-9 bg-background text-[13px]"
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-1 h-9 text-[13px] ">
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </AuthShell>
  );
};

 
export default Login;   