import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleOAuthCallback(token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return <div className="flex items-center justify-center h-screen">Logging in...</div>;
};

export default OAuthCallback;
