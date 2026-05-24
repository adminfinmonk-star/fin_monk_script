import Image from 'next/image';

interface Props {
  size?: number;
  variant?: "color" | "white";
  showWordmark?: boolean;
}

export default function FinmonkLogo({ size = 36, variant = "color", showWordmark = true }: Props) {
  const icon = (
    <Image
      src="/finmonk-logo.png"
      alt="Finmonk"
      width={size}
      height={size}
      priority={true}
    />
  );

  const colors = variant === "white"
    ? { fin: "#ffffff", monk: "#ffffff" }
    : { fin: "#1a1f36", monk: "#7C5CFC" };

  if (!showWordmark) return icon;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {icon}
      <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: size * 0.56 }}>
        <span style={{ color: colors.fin }}>Fin</span>
        <span style={{ color: colors.monk }}>monk</span>
      </span>
    </div>
  );
}
