import { ArrowRight, Award, Check, Clock, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface TrainingTier {
  level: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  classSize: number;
  certification: boolean;
  curriculum: readonly string[];
}

interface TrainingTierCardProps {
  tier: TrainingTier;
  featured?: boolean;
}

export function TrainingTierCard({ tier, featured }: TrainingTierCardProps) {
  const url = buildWhatsAppUrl({ intent: "training" });

  return (
    <div className={cn("relative", featured && "mt-4")}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-accent-rose text-white rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}
      <article
        className={cn(
          "group relative flex flex-col rounded-2xl border p-6 md:p-8 transition-all duration-500 overflow-hidden bg-card text-text-primary border-border shadow-sm hover:shadow-lg hover:-translate-y-1",
          featured && "ring-2 ring-accent-rose md:scale-105"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-rose/60 via-accent-gold/40 to-transparent" />

        <span className="inline-block self-start px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-bg-blush text-accent-rose rounded-full mb-4">
          {tier.level}
        </span>

        <h3 className="font-display text-xl md:text-2xl font-medium text-text-primary">
          {tier.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {tier.description}
        </p>

        <div className="mt-5">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-muted/70">
            From
          </span>
          <span className="font-display text-4xl md:text-5xl font-semibold leading-tight text-accent-rose">
            {formatPrice(tier.price)}
          </span>
        </div>

        <div className="my-6 h-px w-full bg-border" />

        <div className="flex flex-wrap gap-4 text-sm text-text-muted mb-6">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent-gold" />
            {tier.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-accent-gold" />
            Max {tier.classSize} students
          </span>
          {tier.certification && (
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent-gold" />
              Certificate included
            </span>
          )}
        </div>

        <ul className="space-y-3 flex-grow">
          {tier.curriculum.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-text-muted"
            >
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 w-full rounded-full font-medium text-sm py-3 transition-all duration-300 bg-accent-rose hover:bg-accent-rose-dark text-white shadow-md hover:shadow-lg"
        >
          Enquire Now <ArrowRight className="w-4 h-4" />
        </a>
      </article>
    </div>
  );
}
