import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Wrench, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const navigate = useNavigate();
  const { login, signup, resetPassword, isLoggedIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isForgot) {
      const result = await resetPassword(email);
      setIsLoading(false);
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
      return;
    }

    const result = isLogin 
      ? await login(email, password)
      : await signup(email, password);

    setIsLoading(false);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Something went wrong');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">HVAC Quote</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
            {isForgot && (
              <Link 
                to="/auth?mode=login" 
                className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            )}

            <h1 className="text-2xl font-bold text-foreground">
              {isForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isForgot 
                ? 'Enter your email to receive a reset link.'
                : isLogin 
                  ? 'Log in to access your quotes and settings.'
                  : 'Start creating professional HVAC quotes today.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tech@hvaccompany.com"
                  required
                  className="h-14 text-base"
                  autoComplete="email"
                />
              </div>

              {!isForgot && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-14 pr-12 text-base"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <Link 
                    to="/auth?mode=forgot" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="h-14 w-full text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading 
                  ? 'Please wait...' 
                  : isForgot 
                    ? 'Send Reset Link'
                    : isLogin 
                      ? 'Log In' 
                      : 'Create Account'}
              </Button>
            </form>

            {!isForgot && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link 
                  to={`/auth?mode=${isLogin ? 'signup' : 'login'}`}
                  className="font-medium text-primary hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
