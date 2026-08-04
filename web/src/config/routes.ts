export const routes = {
  home: "/",
  buyer: {
    newRequest: "/buyer/requests/new",
    dashboard: "/buyer/requests",
    request: (id: string) => `/buyer/requests/${id}`,
  },
  contributor: {
    device: "/contributor/device",
    browse: "/contributor/requests",
    fulfill: (id: string) => `/contributor/requests/${id}/fulfill`,
    submissions: "/contributor/submissions",
  },
} as const;

export const buyerNav = [
  { href: routes.buyer.dashboard, label: "Requests" },
  { href: routes.buyer.newRequest, label: "New request" },
];

export const contributorNav = [
  { href: routes.contributor.browse, label: "Browse" },
  { href: routes.contributor.submissions, label: "Submissions" },
  { href: routes.contributor.device, label: "Device" },
];
