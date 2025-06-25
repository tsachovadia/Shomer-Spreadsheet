import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Client-side authorization check
      const API_URL = import.meta.env.VITE_API_URL;
      const authCheckUrl = `${API_URL}?action=isAuthorized&email=${encodeURIComponent(user.email!)}`;
      const authResponse = await fetch(authCheckUrl);
      const authData = await authResponse.json();

      if (!authData.isAuthorized) {
        // If not authorized, sign out immediately and show an error
        await signOut(auth);
        throw new Error("This email address is not authorized for access.");
      }
      
      onLogin({
        email: user.email,
        name: user.displayName,
      });

    } catch (error: any) {
      console.error("Authentication or Authorization failed:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Login process was cancelled. Please try again.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError("Multiple login attempts detected. Please complete the existing login or try again.");
      } else if (error.message.includes("not authorized")) {
        setError("Your email is not authorized for access. Please contact support.");
      }
      else {
        setError(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <title>Google Logo</title>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
        c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
        s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
        C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
        c-5.222,0-9.658-3.417-11.27-7.962l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238
        C42.612,35.845,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <img src="/brand_assets/svg/Color logo - no background.svg" alt="Segula Logo" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-gray-600">Investor Portal</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Welcome
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Sign in to access your investment dashboard
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing In..."
                ) : (
                  <>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 