import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const login = async () => {
      const redirectTo = `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo
        }
      });

    if (error) console.log(error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Login Page</h1>

      <button 
        onClick={login}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-full font-semibold shadow-lg shadow-blue-500/20"
      >
        Login with Google
      </button>
    </div>
  );
}
