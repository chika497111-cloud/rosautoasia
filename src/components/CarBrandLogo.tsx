/** Simple SVG-based car brand logos for the brand selection grid. */

const brandLogos: Record<string, React.ReactNode> = {
  toyota: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="22" ry="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="24" cy="24" rx="13" ry="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="5" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  hyundai: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="bold" fontStyle="italic" fontFamily="Arial, sans-serif">H</text>
      <ellipse cx="24" cy="24" rx="21" ry="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  ),
  kia: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">KIA</text>
      <line x1="6" y1="36" x2="42" y2="36" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  honda: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="bold" fontFamily="Arial, sans-serif">H</text>
      <rect x="4" y="6" width="40" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  ),
  nissan: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="4" />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif" fill="var(--color-surface-lowest, #fff)">NISSAN</text>
    </svg>
  ),
  mitsubishi: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <polygon points="24,4 17,16 31,16" />
      <polygon points="13,20 6,32 20,32" />
      <polygon points="35,20 28,32 42,32" />
    </svg>
  ),
  mazda: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="21" ry="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 24 Q18 14, 24 18 Q30 14, 36 24" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 18 V28" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  subaru: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="21" ry="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <circle cx="28" cy="15" r="2" />
      <circle cx="35" cy="20" r="2" />
      <circle cx="28" cy="28" r="2" />
      <circle cx="35" cy="26" r="2" />
      <circle cx="14" cy="26" r="3" />
    </svg>
  ),
  lexus: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="21" ry="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold" fontStyle="italic" fontFamily="Arial, sans-serif">L</text>
    </svg>
  ),
  chevrolet: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <rect x="4" y="18" width="40" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="10" y="20" width="28" height="8" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  daewoo: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="21" ry="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 24 C12 16, 24 10, 36 24" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  chery: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <ellipse cx="24" cy="24" rx="21" ry="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">C</text>
    </svg>
  ),
  geely: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="3" />
    </svg>
  ),
  haval: (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="currentColor">
      <rect x="4" y="10" width="40" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">H</text>
    </svg>
  ),
};

/** Fallback generic car icon */
function GenericCarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h4m-4 0H9m4 0a1 1 0 01-1 1H6a1 1 0 01-1-1m14 0V9a1 1 0 00-1-1h-2l-3-4H8" />
    </svg>
  );
}

export function CarBrandLogo({ brandId }: { brandId: string }) {
  const logo = brandLogos[brandId];
  return logo ? <>{logo}</> : <GenericCarIcon />;
}
