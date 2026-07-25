import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
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
    <div className="flex justify-center items-start mt-10 min-h-screen bg-canvas">
      <div>
        <p className="text-subtext">Sign in with college mail to continue</p>
        <div ref={loginbtnref}></div>
      </div>
    </div>
  );
};

export default Login;
