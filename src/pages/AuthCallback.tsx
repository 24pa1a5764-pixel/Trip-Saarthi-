import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "@/components/trip/SplashScreen";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth callback error:", error.message);
          // You might want to show an error message or redirect to login
          navigate("/", { replace: true });
          return;
        }
        // Redirect to home page after session is handled
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Auth callback unexpected error:", err);
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return <SplashScreen />;
}
