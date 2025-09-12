import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chrome, Rocket, TrendingUp, Mail, Shield } from "lucide-react";

export default function Register() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="absolute top-40 right-20 w-72 h-72 bg-orange-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <Rocket className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text">Get Started Today</h1>
          <p className="mt-2 text-gray-600">Join thousands accelerating their job search</p>
        </div>

        <Card className="glass shadow-2xl border-0 card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Start automating your job applications in seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits list */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">10x faster job applications</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">AI-powered personalized emails</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Secure & private data handling</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Get started</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full flex items-center justify-center gap-3 h-12 btn-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <Chrome className="h-5 w-5" />
              Sign Up with Google
            </Button>

            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to grant access to send emails on your behalf.
              <br />
              <span className="font-semibold">Free to start • No credit card required</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}