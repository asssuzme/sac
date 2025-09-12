import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumeTextChange: (text: string | null) => void;
}

export function ResumeUpload({ onResumeTextChange }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .pdf, .jpg, .jpeg, .png, or .webp file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      if (file.type === 'text/plain') {
        // Handle text files - upload to server for storage
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload resume');
        }
        
        // Also update the text display
        const text = await file.text();
        const cleanedText = text.replace(/\0/g, '').trim();
        onResumeTextChange(cleanedText);
      } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        // Handle PDF and image files by sending to server for parsing and storage
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to process file');
        }
        
        // For PDFs and images, just indicate successful upload
        // The server has extracted text and stored the full file
        onResumeTextChange(`Resume uploaded: ${file.name}`);
      } else {
        toast({
          title: "File format not supported",
          description: "Only .txt, .pdf, .jpg, .jpeg, .png, and .webp files are supported.",
          variant: "destructive",
        });
        setFileName(null);
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process your resume. Please try again.",
        variant: "destructive",
      });
      setFileName(null);
      onResumeTextChange(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setFileName(null);
    onResumeTextChange(null);
    // Reset the file input
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="glass shadow-xl border-0 animate-fade-in">
      <CardHeader className="pb-5">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Resume Upload (Optional)
        </CardTitle>
        <CardDescription className="text-base">
          Upload your resume to generate AI-powered personalized application emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!fileName ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-primary/5 transition-all duration-300 group">
            <Upload className="h-12 w-12 text-gray-400 mb-4 group-hover:text-primary transition-colors" />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <input
                id="resume-upload"
                type="file"
                accept=".txt,.pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={isProcessing}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Accepts .txt, .pdf, .jpg, .jpeg, .png, and .webp files
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 hover:shadow-md hover:border-primary transition-all duration-300"
              onClick={() => document.getElementById('resume-upload')?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{fileName}</p>
                <p className="text-sm text-green-600">Resume uploaded successfully</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}