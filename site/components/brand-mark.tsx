export function Mark({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 4h6v12h-6zM10 10h6v6h-6zM22 4h6v12h-6zM4 16h6v12h-6zM16 16h6v6h-6zM22 16h6v12h-6z" />
    </svg>
  );
}
