import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import React from "react";
import { EmailTemplateForm } from "./template-form";

const EditTemplatePage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const template = await prisma.emailTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Edit Template: {template.name}</h1>
          <p className="text-sm text-slate-400">Customize the subject and content of this automated email.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-xl max-w-4xl">
        <EmailTemplateForm template={template} />
      </div>
      
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 max-w-4xl">
        <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase">Variable Tags Guide:</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Use the following tags in your content to dynamically insert data. These will be replaced with actual values when the email is sent:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{name}}"}</span> - Customer Name</div>
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{carTitle}}"}</span> - Vehicle Title</div>
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{newPrice}}"}</span> - Updated Price</div>
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{date}}"}</span> - Booking Date</div>
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{link}}"}</span> - Vehicle Link</div>
          <div className="bg-gray-900/50 p-1 rounded"><span className="text-blue-500">{"{{description}}"}</span> - Short Description</div>
        </div>
      </div>
    </div>
  );
};

export default EditTemplatePage;
