interface ModuleHeaderProps {
  sqlNumber: number;
  title: string;
  description: string;
  questions: string[];
}

export default function ModuleHeader({ sqlNumber, title, description, questions }: ModuleHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent-lime/10 text-accent-lime text-xs font-display font-semibold tracking-wider">
          SQL {sqlNumber}
        </span>
      </div>
      <h2 className="section-title text-3xl mb-3">{title}</h2>
      <p className="text-sm text-txt-secondary max-w-3xl leading-relaxed mb-5">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-700/50 border border-base-600/40 text-xs text-txt-secondary"
          >
            <span className="w-4 h-4 rounded-full bg-accent-purple/15 text-accent-purple text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}
