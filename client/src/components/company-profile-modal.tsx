import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Globe, Calendar, MapPin, Briefcase, ExternalLink, Mail, Check, Copy } from "lucide-react";
import { useState } from "react";

interface CompanyProfile {
  name?: string;
  description?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  website?: string;
  specialties?: string[];
  founded?: string;
  employees?: string;
  logo?: string;
  tagline?: string;
  updates?: any[];
  linkedinUrl?: string;
}

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyProfile | null;
  isLoading: boolean;
  jobEmail?: string;
  onProceedToApply?: () => void;
  generatedEmail?: string;
  isGeneratingEmail?: boolean;
}

export function CompanyProfileModal({ 
  isOpen, 
  onClose, 
  companyProfile, 
  isLoading, 
  jobEmail,
  onProceedToApply,
  generatedEmail,
  isGeneratingEmail 
}: CompanyProfileModalProps) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : companyProfile ? (
          <>
            <DialogHeader>
              <div className="flex items-start space-x-4">
                {companyProfile.logo && (
                  <img 
                    src={companyProfile.logo} 
                    alt={`${companyProfile.name} logo`} 
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{companyProfile.name}</DialogTitle>
                  {companyProfile.tagline && (
                    <DialogDescription className="text-base mt-1">
                      {companyProfile.tagline}
                    </DialogDescription>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Company Description */}
              {companyProfile.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {companyProfile.description}
                  </p>
                </div>
              )}

              {/* Company Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {companyProfile.industry && (
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Industry</p>
                      <p className="text-sm text-gray-900">{companyProfile.industry}</p>
                    </div>
                  </div>
                )}
                
                {companyProfile.size && (
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Company Size</p>
                      <p className="text-sm text-gray-900">{companyProfile.size}</p>
                    </div>
                  </div>
                )}
                
                {companyProfile.headquarters && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Headquarters</p>
                      <p className="text-sm text-gray-900">{companyProfile.headquarters}</p>
                    </div>
                  </div>
                )}
                
                {companyProfile.founded && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Founded</p>
                      <p className="text-sm text-gray-900">{companyProfile.founded}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {companyProfile.specialties && companyProfile.specialties.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center space-x-4 pt-4 border-t">
                {companyProfile.website && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(companyProfile.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
                {companyProfile.linkedinUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(companyProfile.linkedinUrl, '_blank')}
                  >
                    <Building2 className="h-4 w-4 mr-1" />
                    LinkedIn
                  </Button>
                )}
              </div>

              {/* Generated Email Section */}
              {(generatedEmail || isGeneratingEmail) && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Generated Application Email</h3>
                  {isGeneratingEmail ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {generatedEmail}
                      </pre>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedEmail || "");
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Apply Action */}
              {jobEmail && onProceedToApply && generatedEmail && (
                <div className="flex items-center justify-between pt-4 border-t bg-green-50 -mx-6 px-6 py-4 -mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ready to apply?</p>
                    <p className="text-xs text-gray-600 mt-1">Send your application to: {jobEmail}</p>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={onProceedToApply}
                    disabled={!generatedEmail || isGeneratingEmail}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Send Application
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Failed to load company profile</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}