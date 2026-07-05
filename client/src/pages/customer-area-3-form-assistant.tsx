import React from 'react';
import FormAssistant from '@/components/form-assistant/FormAssistant';
import { CheckCircle, Sparkles } from '@/components/icons';

export default function CustomerArea3FormAssistant() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-xl shadow-md shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Formular-Assistent</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Rechtssichere regulatorische Vorlagen — Pflichtfelder sind markiert, Textbausteine sind vorgegeben.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Multi-Tenant · revisionssicher · audit-fähig</span>
        </div>
      </div>

      <FormAssistant />
    </div>
  );
}
