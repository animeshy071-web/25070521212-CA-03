/* Minimal inline icon set (stroke style, 20x20 viewBox) */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ children, size = 20, viewBox = '0 0 24 24', ...rest }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} aria-hidden="true" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const IconDashboard = (p) => (
  <Icon {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></Icon>
);

export const IconMarkets = (p) => (
  <Icon {...p}><path d="M3 20h18" /><path d="M4 16l4.5-5 3.5 3L20 6" /><path d="M20 10V6h-4" /></Icon>
);

export const IconStar = (p) => (
  <Icon {...p}><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" /></Icon>
);

export const IconPortfolio = (p) => (
  <Icon {...p}><rect x="3.5" y="7" width="17" height="13" rx="2" /><path d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7" /><path d="M3.5 12.5h17" /></Icon>
);

export const IconTrade = (p) => (
  <Icon {...p}><path d="M7 4v13" /><path d="M4 8l3-4 3 4" /><path d="M17 20V7" /><path d="M14 16l3 4 3-4" /></Icon>
);

export const IconList = (p) => (
  <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></Icon>
);

export const IconNews = (p) => (
  <Icon {...p}><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M7 9h6M7 12.5h10M7 16h10" /></Icon>
);

export const IconUser = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" /></Icon>
);

export const IconSearch = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Icon>
);

export const IconLogout = (p) => (
  <Icon {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></Icon>
);

export const IconMenu = (p) => (
  <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
);

export const IconClose = (p) => (
  <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>
);

export const IconPlus = (p) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);

export const IconTrash = (p) => (
  <Icon {...p}><path d="M4 7h16" /><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /><path d="M6.5 7l1 12a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-12" /></Icon>
);

export const IconArrow = (p) => (
  <Icon {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Icon>
);

export const IconInfo = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.5" fill="currentColor" /></Icon>
);
