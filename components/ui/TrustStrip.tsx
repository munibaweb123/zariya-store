const ITEMS = [
  {
    label: "Handpicked Quality",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <circle cx="12" cy="9" r="6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 2 2 4-4M9 14.5 7.5 21 12 18.5 16.5 21 15 14.5" />
      </svg>
    ),
  },
  {
    label: "Cash on Delivery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <rect x="3" y="6" width="18" height="12" rx="1.5" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Nationwide Shipping",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4l3 3v3h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </svg>
    ),
  },
];

export function TrustStrip() {
  return (
    <div className="grid grid-cols-3 gap-gutter bg-blush px-margin-mobile py-section-mobile md:px-margin-desktop">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2 text-center text-charcoal">
          {item.icon}
          <p className="text-label-caps">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
