import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, signup, isAuthenticated, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) navigate("/home");
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/home");
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google auth error:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pokeball-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full border-[50px] border-white/[0.03]" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full border-[40px] border-white/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.02]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 mb-4 animate-float shadow-lg shadow-red-900/40 relative">
            {/* Pokéball design */}
            <div className="w-full h-full rounded-full overflow-hidden relative border-4 border-gray-900">
              <div className="absolute inset-0 bg-gradient-to-b from-[#E3350D] to-[#B02800]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 48%, 0 48%)' }} />
              <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 52%, 100% 52%, 100% 100%, 0 100%)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-800 z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-800 rounded-full" />
              </div>
              <div className="absolute top-[46%] left-0 right-0 h-[8%] bg-gray-900" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-wider text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            CAMPUS<span className="text-[#FFCB05]">CATCH</span>
          </h1>
          <p className="text-sm text-white/50 mt-1 font-semibold tracking-widest uppercase">Gotta Find 'Em All</p>
        </div>

        {/* Card */}
        <div className="card-minimal p-8 animate-scaleIn">
          <div className="flex gap-2 mb-6 p-1 bg-white/[0.05] rounded-xl">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'btn-poke-primary' : 'text-white/50 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'btn-poke-primary' : 'text-white/50 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block mb-1.5">Trainer Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-poke pl-10"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-poke pl-10"
                  placeholder="you@campus.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-poke pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-poke-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="pokeball-spinner w-5 h-5" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Please wait...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  {isSignUp ? "Create Account" : "Login"}
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="divider-poke w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#1A1A2E] text-white/40 font-semibold uppercase tracking-widest">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="btn-poke-ghost w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Your campus lost & found, reimagined.
        </p>
      </div>
    </div>
  );
}
