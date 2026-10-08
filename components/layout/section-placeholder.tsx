type SectionPlaceholderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function SectionPlaceholder({
  description,
  eyebrow,
  title,
}: SectionPlaceholderProps) {
  const titleId = `${title.toLowerCase()}-title`;

  return (
    <section className="section-placeholder" aria-labelledby={titleId}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 id={titleId}>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
