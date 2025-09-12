import { Link } from "wouter";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-background/95 backdrop-blur-xl border-t">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold">AI JobHunter</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Revolutionizing AI job search with automated job applications. Get hired faster with our AI-powered job finder.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm sm:text-base font-semibold">Product</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/features" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  How it Works
                </Link>
              </li>
              <li>
                <a href="https://autoapply.ai" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Homepage
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm sm:text-base font-semibold">Legal</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-delivery" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Shipping and Delivery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm sm:text-base font-semibold">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <a href="mailto:support@ai-jobhunter.com" className="hover:text-primary transition-colors break-all">
                  support@ai-jobhunter.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Bengaluru, Karnataka<br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} AutoApply.ai. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-red-500 text-red-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}