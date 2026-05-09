'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RenderFieldUI } from '@/components/form-builder/builder-elements';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

export default function PublicFormPage() {
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch('/api/forms');
        if (res.ok) {
          const forms = await res.json();
          const found = forms.find((f: any) => String(f.id) === params.id) || forms[0];
          setForm(found);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadForm();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submission = {
        formId: form.id,
        formTitle: form.title,
        data: {
          "Name": "Public User", // Simplified for demo
          "Source": "Direct Link"
        }
      };
      
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      
      if (res.ok) {
        toast.success('Thank you! Your response has been submitted.');
      }
    } catch (e) {
      toast.error('Submission failed.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center">Form not found.</div>;

  return (
    <div className="min-h-screen bg-off-white py-12 px-4">
      <div className="max-w-[700px] mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-light-gray/50">
          {/* Header */}
          <div className="bg-vision-green p-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{form.title}</h1>
              <p className="text-white/80 text-sm mt-1">Please fill out the details below.</p>
            </div>
            <Image src="/images/logo-icon.svg" alt="VS" width={40} height={40} className="brightness-0 invert opacity-50" />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {form.instances?.map((instance: any) => (
              <div key={instance.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <RenderFieldUI 
                  type={instance.elementId} // In a real app this would be more complex
                  label={instance.customLabel || "Field"} 
                  properties={instance.properties} 
                />
              </div>
            ))}
            
            {(!form.instances || form.instances.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-light-gray rounded-xl">
                <p className="text-mid-gray italic">This form has no fields yet.</p>
              </div>
            )}

            <div className="pt-6 border-t border-light-gray/40">
              <Button type="submit" className="w-full h-12 bg-vision-green hover:bg-green-dark text-white font-bold text-lg rounded-xl shadow-lg shadow-vision-green/20 transition-all active:scale-[0.98]">
                Submit Form
              </Button>
              <p className="text-center text-[10px] text-mid-gray mt-4 font-medium uppercase tracking-widest">
                Powered by VisionSolar
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
