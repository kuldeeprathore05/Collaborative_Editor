import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/AuthShell.jsx";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      login(res.data.token, res.data.user);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };
 

  const field = "text-[11px] uppercase tracking-wider text-muted-foreground";

  return (
    <AuthShell
      title="Create account"
      subtitle="Start coding together in seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className={field}>
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="h-9 bg-background text-[13px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={field}>
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
          <Label htmlFor="password" className={field}>
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

        <Button type="submit" disabled={loading} className="mt-1 h-9 text-[13px] bg-emerald-600 hover:bg-emerald-700">
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Signup;