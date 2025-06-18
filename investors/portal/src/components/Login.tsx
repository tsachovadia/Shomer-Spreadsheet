import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const data = await response.json();

        if (data.error || data.status !== 'success') {
            throw new Error(data.error || "Login failed");
        }

        onLogin({
            email: data.user.email,
            name: data.user.sheetName, // We can get the real name in the dashboard component
            groupId: '' // This will be fetched in the dashboard
        });

    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please check your credentials.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <div className="text-2xl font-bold text-indigo-600">S</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Segula</h1>
          <p className="text-gray-600">Investor Portal</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Sign in to access your investment dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure investor portal • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 