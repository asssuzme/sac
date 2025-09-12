import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chrome, Briefcase, Sparkles } from "lucide-react";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute top-10 left-10 md:top-20 md:left-20 w-48 md:w-72 h-48 md:h-72 bg-purple-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 w-56 md:w-96 h-56 md:h-96 bg-blue-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-6 md:space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Briefcase className="h-8 md:h-10 w-8 md:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">ai-jobhunter.com</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            AI-powered job search automation
          </p>
        </div>

        <Card className="glass shadow-2xl border-0 card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full flex items-center justify-center gap-3 h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Features</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-2 text-center text-xs text-muted-foreground">
              <div className="p-1 md:p-2">
                <div className="font-semibold text-primary text-[10px] md:text-xs">Smart Scraping</div>
                <div className="text-[9px] md:text-xs">LinkedIn Jobs</div>
              </div>
              <div className="p-1 md:p-2 border-x">
                <div className="font-semibold text-primary text-[10px] md:text-xs">AI Filtering</div>
                <div className="text-[9px] md:text-xs">Quality Leads</div>
              </div>
              <div className="p-1 md:p-2">
                <div className="font-semibold text-primary text-[10px] md:text-xs">Auto Email</div>
                <div className="text-[9px] md:text-xs">Personalized</div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              By signing in, you agree to grant access to send emails on your behalf
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}