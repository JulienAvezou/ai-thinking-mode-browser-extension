import type { ThinkingMode } from "../../shared/modes";

interface RecommendationCardProps {
  mode: ThinkingMode;
  reason: string;
}

export default function RecommendationCard({ mode, reason }: RecommendationCardProps) {
  return (
    <section className="recommendation-card" aria-label="Recommended thinking mode">
      <p className="section-kicker">Recommended mode</p>
      <h2>{mode.label}</h2>
      <p>{mode.summary}</p>
      <p className="reason">{reason}</p>
    </section>
  );
}
