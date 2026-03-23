import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "@/components/trip/SplashScreen";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error.message);
      }
      // Redirect to home page after session is handled
      navigate("/", { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return <SplashScreen />;
}
