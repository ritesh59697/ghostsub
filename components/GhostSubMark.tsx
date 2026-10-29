export function GhostSubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="13" fill="#111A39" />
      <path
        d="M20 7.5c-5.15 0-9.35 4.2-9.35 9.35v12.6l4.68-2.46L20 29.45l4.67-2.46 4.68 2.46v-12.6C29.35 11.7 25.15 7.5 20 7.5Z"
        stroke="#D6FF38"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="18.25" r="2.15" fill="#D6FF38" />
      <circle cx="20" cy="18.25" r="4.35" stroke="#D6FF38" strokeOpacity=".45" strokeWidth=".8" />
      <path d="M15.5 23.1h2.4m4.2 0h2.4" stroke="#B7C8E8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 4.3v1.4M4.3 20h1.4m28.6 0h1.4" stroke="#D6FF38" strokeOpacity=".75" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
