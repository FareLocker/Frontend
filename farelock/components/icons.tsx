type IconProps = { className?: string };

export function SearchIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="7.5" cy="7.5" r="5.5" />
      <path d="M12 12l4.5 4.5" />
    </svg>
  );
}

export function CirclePlusIcon({ className = "h-[1.1em] w-[1.1em]" }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v6M5 8h6" />
    </svg>
  );
}

export function UserIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function LockIcon({ className = "h-11 w-11" }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 44 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
    >
      <rect x="12" y="20" width="20" height="15" rx="3" />
      <path d="M16 20v-5a6 6 0 0 1 12 0v5" />
      <circle cx="22" cy="27.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
