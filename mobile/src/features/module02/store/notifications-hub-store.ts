import { create } from "zustand";

export type NotifCategory = "workout" | "nutrition" | "system";

export type HubNotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  category: NotifCategory;
  body: string;
  highlight?: boolean;
  /** When false, item counts toward inbox badge. */
  read: boolean;
};

const initialItems: HubNotificationItem[] = [
  {
    id: "n1",
    title: "Full Body Strength",
    subtitle: "Starting soon · Guided mode",
    timeLabel: "2 min ago",
    category: "workout",
    body:
      "Your scheduled Full Body Strength workout is ready. Estimated burn: 320 kcal over 35 minutes. Tap start to launch guided mode.",
    highlight: true,
    read: false,
  },
  {
    id: "n2",
    title: "Hydration check-in",
    subtitle: "Daily goal",
    timeLabel: "18 min ago",
    category: "nutrition",
    body: "You are halfway to your water goal. Tap for tips.",
    highlight: false,
    read: false,
  },
  {
    id: "n3",
    title: "Morning Mobility",
    subtitle: "Tomorrow 07:00",
    timeLabel: "1 h ago",
    category: "workout",
    body: "Tomorrow's session is locked in.",
    highlight: false,
    read: false,
  },
  {
    id: "n4",
    title: "Weekly summary",
    subtitle: "Progress recap",
    timeLabel: "Yesterday",
    category: "system",
    body: "Your weekly summary is ready to review.",
    highlight: false,
    read: true,
  },
];

export type NotificationsHubTab = "all" | "workouts" | "nutrition";

type NotificationsHubState = {
  items: HubNotificationItem[];
  systemPermissionDenied: boolean;
  setSystemPermissionDenied: (value: boolean) => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  resetDemo: () => void;
};

export const useNotificationsHubStore = create<NotificationsHubState>((set) => ({
  items: initialItems,
  systemPermissionDenied: false,
  setSystemPermissionDenied: (value) => set({ systemPermissionDenied: value }),
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
    })),
  resetDemo: () => set({ items: initialItems }),
}));

export function countUnreadNotifications(items: HubNotificationItem[]): number {
  return items.filter((i) => i.read !== true).length;
}

export function filterNotificationsForTab(
  items: HubNotificationItem[],
  tab: NotificationsHubTab
): HubNotificationItem[] {
  if (tab === "all") {
    return items;
  }
  if (tab === "workouts") {
    return items.filter((i) => i.category === "workout");
  }
  return items.filter((i) => i.category === "nutrition" || i.category === "system");
}
