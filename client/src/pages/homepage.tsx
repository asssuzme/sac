import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowRight, 
  Briefcase, 
  Sparkles, 
  Search, 
  Mail, 
  CheckCircle, 
  Shield, 
  TrendingUp,
  Users,
  Globe,
  Award,
  Zap,
  Menu,
  X,
  Target,
  Clock,
  FileText,
  Bot,
  ChevronDown,
  Activity,
  Layers,
  Compass,
  PenTool,
  Cpu,
  GitBranch
} from "lucide-react";
import Footer from "@/components/footer";

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Features data
  const features = [
    {
      icon: Search,
      title: "Smart Job Discovery",
      description: "AI-powered search finds the most relevant jobs from LinkedIn based on your preferences.",
      animation: "search"
    },
    {
      icon: Users,
      title: "Contact Discovery",
      description: "Automatically finds hiring manager and recruiter contact information.",
      animation: "contacts"
    },
    {
      icon: Mail,
      title: "AI Email Writer",
      description: "Generates personalized application emails based on your resume.",
      animation: "email"
    },
    {
      icon: TrendingUp,
      title: "Application Tracking",
      description: "Track all your applications in one place with analytics.",
      animation: "tracking"
    },
    {
      icon: Shield,
      title: "Gmail Integration",
      description: "Send emails directly from your Gmail account securely.",
      animation: "gmail"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Apply to 10x more jobs in the same amount of time.",
      animation: "time"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 md:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <h1 className="text-xl font-semibold">AI-JobHunter</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a 
                href="/" 
                className="px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Launch App
              </a>
            </div>

            {/* Mobile CTA */}
            <a 
              href="/" 
              className="md:hidden px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 md:px-8 py-16 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div className="w-full h-full bg-blue-500/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Land Your Dream Job
              <span className="block text-4xl md:text-6xl mt-3 text-gray-400">10x Faster</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              AI automates your entire job search - from finding jobs to sending applications
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
            >
              <a 
                href="/"
                className="px-8 py-4 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition-all flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="text-sm text-gray-500">No credit card required</span>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>2,500+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>5-Star Rated</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Animation - Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="bg-[#1a1a1a] rounded-t-xl border border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="flex-1 bg-[#0a0a0a] rounded-md px-3 py-1 text-xs text-gray-500">
                    ai-jobhunter.com/dashboard
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-b-xl border-x border-b border-white/10 p-8">
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="space-y-4"
                >
                  {/* Animated dashboard preview */}
                  <div className="flex gap-4">
                    <div className="flex-1 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse"></div>
                    <div className="flex-1 h-32 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg animate-pulse"></div>
                    <div className="flex-1 h-32 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-40 bg-white/5 rounded-lg animate-pulse"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Powered By Section - Monochrome */}
      <section className="px-4 md:px-8 py-12 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-12 opacity-40">
            <span className="text-xs uppercase tracking-wider">Powered by</span>
            <div className="flex items-center gap-8">
              <span className="text-sm font-medium">LinkedIn</span>
              <span className="text-sm font-medium">OpenAI</span>
              <span className="text-sm font-medium">Gmail</span>
              <span className="text-sm font-medium">Apify</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Dynamic Numbers */}
      <section className="px-4 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "89", suffix: "%", label: "Response Rate" },
              { value: "30", suffix: "s", label: "Per Application" },
              { value: "97", suffix: "%", label: "Accuracy" },
              { value: "10", suffix: "K+", label: "Jobs Daily" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <motion.div className="text-5xl md:text-6xl font-bold">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-blue-500">{stat.suffix}</span>
                </motion.div>
                <div className="text-sm text-gray-500 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Two Column Layout with Animations */}
      <section className="px-4 md:px-8 py-20" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: Feature List */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`cursor-pointer transition-all ${activeFeature === index ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Animated Visual */}
            <div className="sticky top-32">
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 h-[500px] flex items-center justify-center">
                {/* Feature-specific animations */}
                {activeFeature === 0 && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="space-y-4">
                      <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-blue-500/20 rounded-lg"></div>
                        <div className="h-32 bg-blue-500/20 rounded-lg"></div>
                        <div className="h-32 bg-blue-500/20 rounded-lg"></div>
                        <div className="h-32 bg-blue-500/20 rounded-lg"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeFeature === 1 && (
                  <motion.div
                    key="contacts"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-white/5 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeFeature === 2 && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="bg-white/5 rounded-lg p-6">
                      <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/5 rounded"></div>
                        <div className="h-3 bg-white/5 rounded w-5/6"></div>
                        <div className="h-3 bg-white/5 rounded w-4/6"></div>
                      </div>
                      <div className="mt-6 h-10 bg-blue-500/20 rounded-lg"></div>
                    </div>
                  </motion.div>
                )}
                {activeFeature === 3 && (
                  <motion.div
                    key="tracking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="h-48 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg flex items-end p-4">
                      <div className="flex gap-2 items-end w-full">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                          <div key={i} className="flex-1">
                            <div
                              className="bg-blue-500 rounded-t"
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeFeature === 4 && (
                  <motion.div
                    key="gmail"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-red-500 to-yellow-500 opacity-20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mail className="h-16 w-16 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeFeature === 5 && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full"
                  >
                    <div className="flex items-center justify-center h-full">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center"
                      >
                        <Clock className="h-12 w-12 text-blue-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Flowing Line Design */}
      <section className="px-4 md:px-8 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How AI JobHunter Works</h2>
          </motion.div>

          <div className="relative">
            {/* Flowing curve SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M 100 100 Q 500 150 900 100 T 1300 100"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid md:grid-cols-3 gap-8 relative z-10 pt-20">
              {[
                {
                  step: "01",
                  title: "Set Your Preferences",
                  description: "Upload your resume and specify job titles, locations, and company preferences",
                  icon: PenTool
                },
                {
                  step: "02",
                  title: "AI Finds & Applies",
                  description: "Our AI searches LinkedIn, finds contacts, and sends personalized applications",
                  icon: Cpu
                },
                {
                  step: "03",
                  title: "Track & Interview",
                  description: "Monitor responses, schedule interviews, and land your dream job",
                  icon: Activity
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="absolute -top-2 -left-2 text-4xl font-bold text-white/10">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Clean Cards */}
      <section className="px-4 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$0",
                features: ["10 applications per month", "Basic email templates", "LinkedIn job search"],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Professional",
                price: "$29",
                features: ["Unlimited applications", "AI-powered personalization", "Contact verification", "Priority support", "Analytics dashboard"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$99",
                features: ["Everything in Pro", "Team collaboration", "API access", "Custom integrations", "Dedicated support"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-[#1a1a1a] border-2 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                    : 'bg-[#0f0f0f] border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-blue-500 text-white text-xs font-medium rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-20 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join 2,500+ job seekers landing their dream jobs
            </p>
            
            <a 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition-colors group"
            >
              <Sparkles className="h-5 w-5" />
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}