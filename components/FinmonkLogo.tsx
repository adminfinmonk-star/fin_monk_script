interface Props {
  size?: number;
  variant?: "color" | "white";
  showWordmark?: boolean;
}

export default function FinmonkLogo({ size = 36, variant = "color", showWordmark = true }: Props) {
  const icon = (
    <img
      src="/finmonk-logo.png"
      alt="Finmonk"
      width={size}
      height={size}
    />
  );

  if (!showWordmark) return icon;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {icon}
      <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: size * 0.56 }}>
        <span style={{ color: "#1a1f36" }}>Fin</span>
        <span style={{ color: "#7C5CFC" }}>monk</span>
      </span>
    </div>
  );
}
