import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '@/config/sourceConfig';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { useToast } from '@/hooks/use-toast';

export default function EngineModulePage() {
  const { moduleKey } = useParams();
  const { toast } = useToast();
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/enginemodule/module/${moduleKey}`)
      .then(r => r.json())
      .then(j => {
        if (!j.ok) { toast({ title: "Engine Error", description: j.message, variant: "destructive" }); return; }
        setModuleData(j.module);
      }).catch(e => toast({ title: "Error", description: e.message }));
  }, [moduleKey]);

  if (!moduleData) return <div>Loading engine module...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Engine Module: {moduleData.module_name}</h1>

      <DynamicForm
        config={moduleData.form_json}
        setConfig={() => { }}
        onSubmit={() => { }}
        serviceId={null}
        moduleKey={moduleKey}   // 🟩 ADD THIS
        handleReload={() => { }}
      />
    </div>
  );
}
