"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { sendBulkEmailAction, getEmailTemplatesAction } from "@/app/_actions/email";
import { toast } from "sonner";
import { Mail, Send, Loader2, FileText } from "lucide-react";
import { EmailTemplate } from "@prisma/client";

export const BulkEmailForm = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    if (open) {
      getEmailTemplatesAction().then(res => {
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      });
    }
  }, [open]);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleSend = () => {
    if (!subject || !content) {
      toast.error("Please fill in both subject and content.");
      return;
    }

    startTransition(async () => {
      const res = await sendBulkEmailAction({ subject, content });
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        setSubject("");
        setContent("");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex gap-2">
          <Mail className="w-4 h-4" /> Compose Newsletter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" /> Send Email to All Subscribers
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {templates.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-2 py-1 rounded transition-colors"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Subject</label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. New Inventory Update - December 2025"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Message Content</label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Write your newsletter content here..."
              rows={10}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-black border-none font-medium">Cancel</Button>
          <Button onClick={handleSend} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send to All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
