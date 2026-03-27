import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get Firebase JWT to send to your Rust backend later
      const token = await user.getIdToken();
      localStorage.setItem('movyra_jwt', token);
      localStorage.setItem('movyra_user', JSON.stringify({ uid: user.uid, email: user.email }));
      
      // Navigate to the main app dashboard
      navigate('/dashboard-home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans text-black">
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        <div className="mb-10">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-[#00A3FF] font-black text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-gray-500 font-medium">Log in to your Movyra account to continue.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
              className="w-full bg-[#F3F3F3] border-none rounded-xl py-4 pl-12 pr-4 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full bg-[#F3F3F3] border-none rounded-xl py-4 pl-12 pr-4 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Log in'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/auth-signup" className="text-black font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}