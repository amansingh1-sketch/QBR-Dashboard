interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
