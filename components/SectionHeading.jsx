export function SectionHeading({ eyebrow, children, description, centered = false, }) {
    return (<div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`eyebrow ${centered ? "justify-center" : "justify-start"}`}>
        <span />
        {eyebrow}
      </p>
      <h2 className="section-title">{children}</h2>
      {description && <p className="section-description">{description}</p>}
      <div className={`mt-7 h-px w-16 bg-gradient-to-r from-violet-400 to-violet-400/0 ${centered ? "mx-auto" : ""}`}/>
    </div>);
}
