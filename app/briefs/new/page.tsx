// app/briefs/new/page.tsx
import BriefForm from '@/components/forms/BriefForm';

export const metadata = {
  title: 'Create Brief - Content Calendar',
};

export default function CreateBriefPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <BriefForm />
    </main>
  );
}
