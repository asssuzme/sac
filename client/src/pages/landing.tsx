import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { ArrowRight, Sparkles, Search, Mail, Users, BarChart3, Target, Zap, Globe, Shield, CheckCircle, Star, TrendingUp, Briefcase, Brain, Clock, Award, Calendar, MessageCircle, MessageSquare, Wand2, Link2, BrainCircuit, Gauge, MapPin, Send, Contact, Filter, ArrowDown, Check, Rocket, Building2, ChevronRight, ArrowUpRight, Sparkle, Zap as Lightning, MousePointer, FileText, Bot, Inbox, Activity, PenTool, Cpu, GitBranch, Layers, X, Upload, Menu } from "lucide-react";
import { SiLinkedin, SiOpenai, SiGmail } from "react-icons/si";
import linkedinLogo from "@assets/image_1756213583930.png";
import openaiLogo from "@assets/Open-AI-White-Logo-PNG_1754939061778.jpg";
import mongodbLogo from "@assets/image_1756213591373.png";
import apifyLogo from "@assets/image_1756213599809.png";
import aiJobHunterLogo from "@assets/Blue and White Modern IT Cybersecurity Logo_1756311726744.png";
import Footer from "@/components/footer";
import GlassProcessConsole from "@/components/glass-process-console";
import { Badge } from "@/components/ui/badge";
import { signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Spinner, PageLoader } from "@/components/ui/loading-animations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Ultra-Realistic macOS Window Animation - Cluely.com Style
const PhotorealisticMacOSAnimation = () => {
  const [step, setStep] = React.useState(0);
  const [emailText, setEmailText] = React.useState("");
  const [selectedJobIndex, setSelectedJobIndex] = React.useState(0);
  
  const jobs = [
    { title: "Senior Software Engineer", company: "Stripe", location: "Remote", salary: "$180k - $250k", posted: "2h ago", match: "98%" },
    { title: "Staff Engineer", company: "Linear", location: "San Francisco", salary: "$220k - $300k", posted: "4h ago", match: "95%" },
    { title: "Principal Engineer", company: "Notion", location: "Remote", salary: "$280k - $350k", posted: "1d ago", match: "92%" },
    { title: "Lead Engineer", company: "Vercel", location: "Remote", salary: "$200k - $280k", posted: "2d ago", match: "89%" }
  ];

  const emailContent = "Dear Sarah,\n\nI'm reaching out regarding the Senior Engineer position at Stripe. Your excellent work at Stripe on scalable payment infrastructure particularly caught my attention.\n\nHaving experience with high-performance APIs, I believe my background in distributed systems and team leadership could contribute significantly to your mission.\n\nI'd love to discuss how my expertise aligns with your team's goals.\n\nBest regards,\nAlex Thompson";

  // Continuous animation loop with smooth transitions
  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
      setEmailText("");
      if (step === 0) {
        setSelectedJobIndex(Math.floor(Math.random() * jobs.length));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [step]);

  // Typing animation for email
  React.useEffect(() => {
    if (step === 2) {
      let charIndex = 0;
      const typeEmail = () => {
        if (charIndex <= emailContent.length) {
          setEmailText(emailContent.slice(0, charIndex));
          charIndex++;
          
          let delay = 25;
          const currentChar = emailContent[charIndex - 1];
          if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
            delay = 200;
          } else if (currentChar === ',' || currentChar === ';') {
            delay = 100;
          } else if (currentChar === '\\n') {
            delay = 150;
          } else {
            delay = 25 + Math.random() * 15;
          }
          
          setTimeout(typeEmail, delay);
        }
      };
      setTimeout(typeEmail, 500);
    }
  }, [step]);

  return (
    <div className="w-full h-full relative">
      {/* Subtle Dark Background with Minimal Glow - Black Theme */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%]">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-red-500/5 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "4s" }} />
        </div>
      </div>
      
      {/* 3D Perspective Container */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "2000px" }}>
        {/* Floating macOS Window with Photorealistic 3D Effect */}
        <motion.div
          initial={{ opacity: 0, rotateX: 30, rotateY: -15, scale: 0.8, y: 50 }}
          animate={{ 
            opacity: 1, 
            rotateX: [12, 10, 12],
            rotateY: [-8, -6, -8],
            scale: 1,
            y: [0, -10, 0]
          }}
          transition={{ 
            opacity: { duration: 1.2 },
            rotateX: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 15, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.2, ease: "easeOut" },
            y: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-full max-w-4xl"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(10deg) rotateY(-6deg)",
          }}
        >
          {/* Soft Diffused Shadow for Floating Effect */}
          <div 
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[90%] h-32 bg-black/20 rounded-full blur-3xl"
            style={{ transform: "translateZ(-100px) scaleX(1.2)" }}
          />
          
          {/* Main Window Container with Glass Effect */}
          <div 
            className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl"
            style={{
              boxShadow: `
                0 0 0 0.5px rgba(255, 255, 255, 0.5),
                0 2px 4px rgba(0, 0, 0, 0.05),
                0 12px 24px rgba(0, 0, 0, 0.1),
                0 24px 48px rgba(0, 0, 0, 0.15),
                0 48px 96px rgba(0, 0, 0, 0.2),
                0 96px 192px rgba(0, 0, 0, 0.25)
              `,
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.98) 0%, 
                  rgba(255, 255, 255, 0.95) 50%,
                  rgba(250, 250, 250, 0.98) 100%
                )
              `
            }}
          >
            {/* Glass Sheen/Reflection Layer */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(115deg, 
                    transparent 0%,
                    rgba(255, 255, 255, 0.03) 30%,
                    rgba(255, 255, 255, 0.1) 32%,
                    rgba(255, 255, 255, 0.05) 34%,
                    transparent 50%
                  )
                `,
                transform: "translateZ(1px)"
              }}
            />
            
            {/* macOS Title Bar with Authentic Details */}
            <div className="relative bg-gradient-to-b from-gray-50 to-gray-100/90 backdrop-blur-sm px-4 py-2.5 rounded-t-xl border-b border-gray-200/60">
              <div className="flex items-center">
                {/* Traffic Light Buttons */}
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-3 h-3 rounded-full relative group cursor-pointer"
                    style={{
                      background: "linear-gradient(180deg, #FF6159 0%, #FF3B30 100%)",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.4)"
                    }}
                  >
                    <X className="w-2 h-2 absolute inset-0 m-auto text-red-900/0 group-hover:text-red-900/60 transition-colors" strokeWidth={2.5} />
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-3 h-3 rounded-full relative group cursor-pointer"
                    style={{
                      background: "linear-gradient(180deg, #FFBD2F 0%, #FFB800 100%)",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.4)"
                    }}
                  >
                    <div className="w-2 h-0.5 absolute inset-0 m-auto bg-yellow-900/0 group-hover:bg-yellow-900/60 transition-colors rounded-full" />
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-3 h-3 rounded-full relative group cursor-pointer"
                    style={{
                      background: "linear-gradient(180deg, #28CA42 0%, #1BAD2F 100%)",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.4)"
                    }}
                  >
                    <div className="w-2 h-2 absolute inset-0 m-auto">
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 rotate-45 bg-green-900/0 group-hover:bg-green-900/60 transition-colors" style={{ clipPath: "polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)" }} />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Window Title */}
                <div className="flex-1 text-center">
                  <span className="text-[13px] font-medium text-gray-700 tracking-tight">AI JobHunter</span>
                </div>
                
                {/* Right side spacer for balance */}
                <div className="w-14" />
              </div>
            </div>

            {/* Window Content Area */}
            <div className="relative bg-white rounded-b-xl overflow-hidden" style={{ height: "500px" }}>
              <AnimatePresence mode="wait">
                {/* Step 0: Job List View */}
                {step === 0 && (
                  <motion.div
                    key="jobs"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="p-6 h-full"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Found 847 Jobs</h2>
                      <p className="text-sm text-gray-500">Sorted by relevance</p>
                    </div>
                    
                    <div className="space-y-2">
                      {jobs.map((job, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            backgroundColor: selectedJobIndex === index && step === 0 ? "rgba(59, 130, 246, 0.05)" : "transparent",
                            borderColor: selectedJobIndex === index && step === 0 ? "rgb(59, 130, 246)" : "rgb(229, 231, 235)"
                          }}
                          transition={{ 
                            delay: index * 0.1,
                            backgroundColor: { delay: 2 + index * 0.1 }
                          }}
                          className="p-3 border rounded-lg transition-all cursor-pointer hover:shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{job.title}</h3>
                              <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                              <p className="text-xs text-gray-500 mt-1">{job.salary} • {job.posted}</p>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${selectedJobIndex === index && step === 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                                {job.match} match
                              </div>
                              <motion.button 
                                className={`text-xs mt-1 ${selectedJobIndex === index && step === 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                                animate={{ scale: selectedJobIndex === index && step === 0 ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                Apply now →
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Contact Extraction */}
                {step === 1 && (
                  <motion.div
                    key="contacts"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="p-6 h-full"
                  >
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full mb-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Contact Intelligence</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Decision Makers Found</h2>
                      <p className="text-sm text-gray-500">Direct contacts for {jobs[selectedJobIndex].company}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { name: "Sarah Chen", title: "VP Engineering", verified: true },
                        { name: "David Kim", title: "Head of Product", verified: false },
                        { name: "Emma Wilson", title: "Engineering Manager", verified: true }
                      ].map((contact, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 200 }}
                          className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md ${
                              i === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                              i === 1 ? 'bg-gradient-to-br from-gray-500 to-gray-600' :
                              'bg-gradient-to-br from-purple-500 to-purple-600'
                            }`}>
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {contact.name}
                                {contact.verified && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1 + i * 0.2, type: "spring" }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  </motion.div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{contact.title}</div>
                            </div>
                            {i === 0 && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                                className="px-3 py-1 bg-green-100 rounded-full"
                              >
                                <span className="text-xs font-medium text-green-700">Best Match</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: AI Email Composer */}
                {step === 2 && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="p-6 h-full flex flex-col overflow-hidden"
                  >
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">AI Composer</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Crafting Personalized Email</h2>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">To:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          SC
                        </div>
                        <span className="text-sm font-medium text-gray-900">sarah.chen@stripe.com</span>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="flex-1 bg-gray-50 rounded-lg p-4 relative overflow-y-auto min-h-[200px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {/* AI Processing Indicator */}
                      {emailText.length < emailContent.length / 2 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-blue-100 rounded-md z-10"
                        >
                          <div className="flex gap-1">
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          </div>
                          <span className="text-xs text-blue-700 font-medium">AI Writing</span>
                        </motion.div>
                      )}
                      
                      <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-['SF_Pro_Text',_system-ui,_-apple-system] pr-4">
                        {emailText.split(/(excellent work at Stripe|scalable payment infrastructure|high-performance APIs)/g).map((part, i) => {
                          const isHighlight = ['excellent work at Stripe', 'scalable payment infrastructure', 'high-performance APIs'].includes(part);
                          return isHighlight ? (
                            <motion.span
                              key={i}
                              initial={{ backgroundColor: "transparent" }}
                              animate={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                              transition={{ delay: 0.5 }}
                              className="text-blue-700 px-1 rounded font-medium"
                            >
                              {part}
                            </motion.span>
                          ) : (
                            <span key={i}>{part}</span>
                          );
                        })}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="inline-block w-[2px] h-4 bg-blue-500 ml-[1px] align-middle"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Success State */}
                {step === 3 && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
                    className="p-6 h-full flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                        className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                      >
                        <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
                        <p className="text-gray-600 mb-4">Your personalized application has been delivered</p>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="inline-flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg"
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">97%</div>
                            <div className="text-xs text-gray-500">Match Score</div>
                          </div>
                          <div className="w-px h-10 bg-gray-300" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">3.2s</div>
                            <div className="text-xs text-gray-500">Time Taken</div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Animation Components - Matching Production
const CountUpAnimation = ({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span className={className}>{count}{suffix}</span>;
};

export default function Landing() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');
  const [scrolled, setScrolled] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isAuroraActive, setIsAuroraActive] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const description = urlParams.get('description');
    const authSuccess = urlParams.get('auth');
    
    // Handle successful authentication
    if (authSuccess === 'success') {
      // Invalidate auth cache to force refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Force reload to properly check auth state
      window.location.reload();
      return;
    }
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: description || `OAuth error: ${error}`,
        variant: "destructive"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('gmail_auth') === 'success') {
      toast({
        title: "Gmail Connected!",
        description: "You can now send emails directly from Gmail",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Handle scroll for header effects and section detection
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Detect active section based on scroll position
      const sections = ['features', 'pricing', 'how-it-works'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse movement for aurora effect
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Activate aurora when mouse is in top 120px of viewport
      if (e.clientY <= 120) {
        setIsAuroraActive(true);
      } else {
        setIsAuroraActive(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSignIn = async () => {
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptTermsAndSignIn = async () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Terms to Continue</DialogTitle>
            <DialogDescription>
              Please review and accept our terms before starting your free trial.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="modal-terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="modal-terms"
                className="text-sm text-gray-600 leading-relaxed cursor-pointer"
              >
                I accept the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTermsModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptTermsAndSignIn}
              disabled={!termsAccepted}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Accept & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Mobile Navigation Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-[100] bg-black lg:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-white">AI JobHunter</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <nav className="flex flex-col space-y-4">
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white py-2">Features</Link>
                <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white py-2">How it works</Link>
                <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white py-2">Pricing</Link>
              </nav>
              
              <div className="mt-8">
                <Button
                  onClick={handleSignIn}
                  disabled={!termsAccepted}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all py-6"
                >
                  Start free trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Developer Credit */}
      <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 text-xs text-gray-400">
        developed by{" "}
        <a
          href="https://www.linkedin.com/in/ashutosh-lath-3a374b2b3/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text hover:from-blue-400 hover:to-purple-500 transition-all cursor-pointer font-medium"
        >
          ashutosh lath
        </a>
      </div>

      {/* Hero Section - Matching Production Layout */}
      <section className="relative pt-8 pb-8 sm:pb-12 md:pb-20 px-3 sm:px-6 lg:px-8 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 sm:gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] sm:leading-none">
                Get hired faster
                <br />
                <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">
                  effortlessly
                </span>
                <br className="hidden sm:block" />
                <span className="inline sm:hidden"> </span>with AI JobHunter
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl">
                Unlock LinkedIn's potential with our AI-powered job search tools. Find relevant jobs, extract decision-maker contacts, and send personalized emails—all automatically with automated job applications.
              </p>
              
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-600"
                  />
                  I accept the{" "}
                  <Link href="/terms" className="text-blue-400 hover:underline">
                    Terms & Conditions
                  </Link>
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSignIn}
                  disabled={!termsAccepted}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium transition-all disabled:opacity-50"
                >
                  Start free trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 border border-white/20 bg-transparent text-white rounded-full text-lg font-medium hover:bg-white/10 transition-all"
                >
                  View demo
                </Button>
              </div>
              
              <p className="text-sm text-gray-500">
                7-day free trial • No credit card required
              </p>
            </motion.div>
            
            {/* Floating Logo in Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hidden lg:block"
            >
              <motion.div
                className="relative w-32 h-32"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glowing Background */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Logo Image */}
                <motion.img
                  src={aiJobHunterLogo}
                  alt="AI JobHunter Logo - AI-powered job finder and automated application tool"
                  className="relative w-full h-full object-contain drop-shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                
                {/* Rotating Ring Effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-transparent border-t-blue-400 border-r-purple-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[600px]"
            >
              <PhotorealisticMacOSAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Header */}
      <section id="features" className="py-6 px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to Land Your Dream Job with <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">AI JobHunter</span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience enterprise-grade automation with sophisticated AI that learns, adapts, and delivers results beyond human capability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections - Matching Production Design */}
      <section className="py-8 px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Job Discovery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-600/30">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Smart Discovery Engine</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Smart Job Discovery with Our <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">AI-Powered Job Finder</span>
              </h3>
              
              <p className="text-base sm:text-lg text-gray-400">
                Our AI job search technology scans millions of LinkedIn job listings to find roles that perfectly match your skills, salary, and career goals with automated job applications.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent rounded-3xl" />
              <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Found 847 Jobs</span>
                    <span>Sorted by relevance</span>
                  </div>
                  
                  {jobs.map((job, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-black/60 rounded-lg border border-white/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{job.title}</h4>
                          <p className="text-gray-400">{job.company}</p>
                          <p className="text-sm text-gray-500">{job.salary}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">{job.match}</div>
                          <button className="text-sm text-blue-400">Apply now</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Discovery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] lg:order-1"
            >
              <div className="relative w-full h-full bg-black/90 rounded-3xl border border-gray-600/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
                
                <div className="p-8 h-full flex flex-col justify-center">
                  <motion.div
                    initial={{ scale: 1, y: 0 }}
                    whileInView={{ scale: 0.8, y: -50 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mb-6 p-4 bg-purple-600/20 rounded-xl border border-purple-600/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        S
                      </div>
                      <div>
                        <div className="text-white font-medium">Stripe</div>
                        <div className="text-gray-400 text-sm">Senior Engineer</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2, duration: 1 }}
                    className="h-0.5 bg-gradient-to-r from-purple-600 to-blue-400 mb-6 transform origin-left"
                  />
                  
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Chen", title: "VP Engineering", color: "bg-blue-600" },
                      { name: "David Kim", title: "Head of Product", color: "bg-gray-600" }
                    ].map((contact, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.5 + i * 0.3, duration: 0.6 }}
                        className="p-4 bg-gray-800/60 rounded-xl border border-gray-600/30 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${contact.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{contact.name}</div>
                            <div className="text-gray-400 text-sm">{contact.title}</div>
                          </div>
                          {i === 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 3.5 }}
                              className="w-3 h-3 bg-green-400 rounded-full"
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-600/30">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Contact Intelligence</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Contact Extraction for Direct Access to
                <br />
                <span className="text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">Decision Makers</span>
              </h3>
              
              <p className="text-base sm:text-lg text-gray-400">
                Bypass HR and connect directly with the hiring managers and team leads who can make a real impact on your application.
              </p>
            </motion.div>
          </div>

          {/* AI Email */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-600/30">
                <Bot className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">AI Email Composer</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                AI-Generated Personalized <span className="text-transparent bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text">Email Outreach</span>
                <br />
                That Gets You Hired Faster
              </h3>
              
              <p className="text-base sm:text-lg text-gray-400">
                Our GPT-4 powered engine crafts hyper-personalized emails that reference a candidate's work and qualifications to guarantee a response.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px]"
            >
              <div className="relative w-full h-full bg-black/90 rounded-3xl border border-gray-600/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
                
                <div className="p-8 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                      <Bot className="w-5 h-5" />
                      <span className="font-medium">AI Email Composer</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-gray-300">To:</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">SC</div>
                        <span className="text-blue-400">sarah.chen@stripe.com</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                    className="bg-gray-800/40 rounded-lg p-4 border border-gray-600/30 mb-4"
                  >
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Generating...</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2 }}
                    className="bg-gray-800/40 rounded-lg p-4 border border-gray-600/30 flex-1"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.5, duration: 2 }}
                      className="text-gray-300 text-sm leading-relaxed"
                    >
                      <div>Dear Sarah,</div>
                      <br />
                      <div>I'm reaching out regarding the Senior Engineer position at Stripe. Your <span className="text-blue-400 bg-blue-400/20 px-1 rounded">excellent work at Stripe</span> on <span className="text-blue-400 bg-blue-400/20 px-1 rounded">scalable payment infrastructure</span> particularly caught my attention.</div>
                      <br />
                      <div>Having experience with <span className="text-blue-400 bg-blue-400/20 px-1 rounded">high-performance APIs</span>, I...</div>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-blue-400"
                      >
                        |
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Pipeline Section - Zero Interaction */}
      <section id="how-it-works" className="relative bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Static Header - No Animation */}
          <div className="text-center py-8 md:py-10 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              How AI JobHunter Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-400">
              Fully automated job application system with LinkedIn job automation
            </p>
          </div>

          {/* Aetherial Engine Container */}
          <GlassProcessConsole />
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Store jobs for the animation
const jobs = [
  { title: "Senior Software Engineer", company: "Stripe", salary: "$160k", match: "98%" },
  { title: "Staff Engineer", company: "Linear", salary: "$200k", match: "95%" },
  { title: "Principal Engineer", company: "Notion", salary: "$240k", match: "92%" }
];