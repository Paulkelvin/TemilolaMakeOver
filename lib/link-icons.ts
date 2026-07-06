import {
  Calendar,
  CalendarDays,
  Image as ImageIcon,
  Images,
  Tag,
  Sparkles,
  MessageCircle,
  Phone,
  AtSign,
  Share2,
  Send,
  Globe,
  Star,
  Heart,
  ShoppingBag,
  Mail,
  MapPin,
  Gift,
  Camera,
  type LucideIcon,
} from "lucide-react";

export interface LinkIconOption {
  value: string;
  title: string;
  icon: LucideIcon;
}

export const LINK_ICON_OPTIONS: LinkIconOption[] = [
  { value: "calendar", title: "Calendar", icon: Calendar },
  { value: "calendar-days", title: "Calendar (detailed)", icon: CalendarDays },
  { value: "image", title: "Image / Gallery", icon: ImageIcon },
  { value: "images", title: "Multiple Images", icon: Images },
  { value: "tag", title: "Price Tag", icon: Tag },
  { value: "sparkles", title: "Sparkles", icon: Sparkles },
  { value: "message-circle", title: "Chat / Message", icon: MessageCircle },
  { value: "phone", title: "Phone", icon: Phone },
  { value: "camera", title: "Camera / Instagram", icon: Camera },
  { value: "at-sign", title: "Social Handle (@)", icon: AtSign },
  { value: "share", title: "Share", icon: Share2 },
  { value: "send", title: "Send / Telegram", icon: Send },
  { value: "globe", title: "Globe / Website", icon: Globe },
  { value: "star", title: "Star", icon: Star },
  { value: "heart", title: "Heart", icon: Heart },
  { value: "shopping-bag", title: "Shopping Bag", icon: ShoppingBag },
  { value: "mail", title: "Mail / Email", icon: Mail },
  { value: "map-pin", title: "Map Pin / Location", icon: MapPin },
  { value: "gift", title: "Gift", icon: Gift },
];

export const LINK_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  LINK_ICON_OPTIONS.map((opt) => [opt.value, opt.icon])
);
