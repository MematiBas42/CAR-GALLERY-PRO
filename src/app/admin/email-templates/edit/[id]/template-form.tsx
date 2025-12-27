"use client";

import { updateEmailTemplateAction } from "@/app/_actions/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmailTemplate } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";

export const EmailTemplateForm = ({ template }: { template: EmailTemplate }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(template.content);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Email Subject</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-400">Email Content (HTML allowed)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white font-mono"
          rows={15}
          required
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-700">
        <Button variant="outline" asChild className="border-gray-600 text-gray-400 hover:text-white">
          <Link href={routes.admin.emailTemplates} className="flex gap-2">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Template
        </Button>
      </div>
    </form>
  );
};
