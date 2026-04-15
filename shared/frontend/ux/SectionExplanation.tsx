type Props = {
  title: string;
  description: string;
  whyItMatters: string;
  decisionSupport: string;
};

export function SectionExplanation({ title, description, whyItMatters, decisionSupport }: Props) {
  return (
    <div className="callout info-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="info-grid">
        <div>
          <strong>Why it matters</strong>
          <p>{whyItMatters}</p>
        </div>
        <div>
          <strong>Decision support</strong>
          <p>{decisionSupport}</p>
        </div>
      </div>
    </div>
  );
}
