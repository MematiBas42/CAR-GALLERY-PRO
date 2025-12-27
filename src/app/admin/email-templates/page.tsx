import { prisma } from "@/lib/prisma";
import React from "react";
import Link from "next/link";
import { Edit2 } from "lucide-react";

const AdminEmailTemplatesPage = async () => {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Email Templates</h1>
          <p className="text-sm text-slate-400">Manage automated email notifications and newsletter templates.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => (
          <div key={template.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col h-full shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">{template.name}</h3>
              <Link 
                href={`/admin/email-templates/edit/${template.id}`}
                className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-full transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2 flex-grow">
              <p className="text-sm text-slate-400"><span className="font-semibold text-slate-300">Subject:</span> {template.subject}</p>
              <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700 text-xs text-slate-500 font-mono h-32 overflow-hidden relative">
                <div className="whitespace-pre-wrap">{template.content}</div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEmailTemplatesPage;
