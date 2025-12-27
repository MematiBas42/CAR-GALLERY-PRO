"use client";

import { updateEmailTemplateAction } from "@/app/_actions/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmailTemplate } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft, Eye, Monitor, Smartphone, Tag } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";

export const EmailTemplateForm = ({ template }: { template: EmailTemplate }) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(template.content);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const variables = ["name", "carTitle", "newPrice", "date", "link", "description"];

  const insertVariable = (variable: string) => {
    const tag = `{{${variable}}}`;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + tag + content.substring(end);
      setContent(newContent);
      // Focus back and set cursor position after the tag
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + tag.length;
        }
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateEmailTemplateAction(template.id, { subject, content });
      if (res.success) {
        toast.success(res.message);
        router.push(routes.admin.emailTemplates);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  // Mock data for preview
  const mockData = {
    name: "John Doe",
    carTitle: "BMW M3 Competition",
    newPrice: "$75,000",
    date: new Date().toLocaleDateString(),
    link: "#",
    description: "Experience the ultimate driving machine with this pristine BMW M3. Featuring a powerful inline-six engine and luxurious interior."
  };

  const getPreviewContent = () => {
    let preview = content;
    Object.keys(mockData).forEach(key => {
      const placeholder = `{{${key}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), mockData[key as keyof typeof mockData]);
    });
    return preview;
  };

  const getPreviewSubject = () => {
    let preview = subject;
    Object.keys(mockData).forEach(key => {
      const placeholder = `{{${key}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), mockData[key as keyof typeof mockData]);
    });
    return preview;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
      {/* Editor Column */}
      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Email Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2 flex-grow flex flex-col">
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Insert Variable
            </label>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] font-mono text-blue-400 transition-colors"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-900 border-gray-700 text-slate-300 font-mono text-sm leading-relaxed flex-grow min-h-[450px] focus:border-blue-500 resize-none"
            required
          />
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Button variant="outline" type="button" asChild className="border-gray-700 text-slate-400 hover:text-white">
            <Link href={routes.admin.emailTemplates} className="flex gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </Button>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>

      {/* Preview Column */}
      <div className="space-y-4 flex flex-col items-center xl:block">
        <div className="flex items-center justify-between mb-2 w-full max-w-[600px] xl:max-w-none">
          <div className="flex items-center gap-2 text-slate-400">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Live Preview</span>
          </div>
          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button 
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded transition-all ${viewMode === "desktop" ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded transition-all ${viewMode === "mobile" ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div 
          className={`bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[600px] transition-all duration-500 ease-in-out mx-auto ${
            viewMode === "mobile" ? "w-[375px]" : "w-full"
          }`}
        >
          {/* Header Simulation */}
          <div className="bg-gray-950 border-b border-gray-800 p-4 space-y-2 shrink-0">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-500 w-12">Subject:</span>
              <span className="text-white font-medium truncate">{getPreviewSubject() || "No subject"}</span>
            </div>
          </div>

          {/* Content Area - Isolated with its own styles */}
          <div className="flex-grow bg-[#f3f4f6] relative overflow-hidden">
             <div className="absolute inset-0 overflow-y-auto">
                <div className={`mx-auto bg-white text-black min-h-full ${viewMode === 'mobile' ? 'p-4' : 'p-10 max-w-[600px]'}`}>
                  <div 
                    className="all-unset-email-preview shadow-sm border border-gray-100 p-6"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                  />
                  <div className="mt-8 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400">
                    1505 S 356th Street, Federal Way, WA 98003<br/>
                    © {new Date().getFullYear()} RIM GLOBAL.
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
