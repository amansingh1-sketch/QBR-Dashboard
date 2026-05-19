"use client";

interface Tag {
  label: string;
  type: "up" | "down" | "arrow" | "neutral";
}

interface Point {
  number: number;
  title: string;
  description: string;
  tags: Tag[];
}

interface Props {
  title: string;
  subtitle: string;
  points: Point[];
}

function Tag({ tag }: { tag: Tag }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium";
  if (tag.type === "up")
    return <span className={`${base} bg-green-50 text-green-700`}>↑ {tag.label}</span>;
  if (tag.type === "down")
    return <span className={`${base} bg-red-50 text-red-700`}>↓ {tag.label}</span>;
  if (tag.type === "arrow")
    return <span className={`${base} bg-blue-50 text-blue-700`}>→ {tag.label}</span>;
  return <span className={`${base} bg-gray-100 text-gray-600`}>{tag.label}</span>;
}

export default function DiscussionPoints({ title, subtitle, points }: Props) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {points.map((point) => (
          <div key={point.number} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                {point.number}
              </span>
              <div className="space-y-2 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{point.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{point.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {point.tags.map((tag, i) => (
                    <Tag key={i} tag={tag} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
