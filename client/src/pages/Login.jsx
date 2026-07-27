import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock } from "lucide-react";
import api from "../api/axios";

const Login = () => {
  const { login } = useAuth();
  const loginbtnref = useRef(null);

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(loginbtnref.current, {
      theme: "outline",
      size: "large",
      width: 280,
    });
  }, []);

  const handleCredentialResponse = async (res) => {
    try {
      const { data } = await api.post("/auth/google", {
        credential: res.credential,
      });

      login(data.token, data.user);
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas p-4 transition-colors">
      {/* Decorative ambient background glow */}
      <div className="absolute size-64 rounded-full bg-accent-600/30 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-overlay/40 bg-surface/80 p-8 shadow-xl backdrop-blur-md transition-all">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-600/10 text-accent-500">
          <Lock size={24} />
        </div>

        {/* Content Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-4xl tracking-tight text-text">
            Welcome To Revenio!
          </h1>
          <p className="text-balance text-m font-sans text-subtext">
            Sign in with your Google Account to continue.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div ref={loginbtnref} />
        </div>
      </div>
    </div>
  );
};

export default Login;
