import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Boxes,
  FileCode,
  Tags as TagsIcon,
  Tag,
  Image,
  Search as SearchIcon,
  Star,
  ListOrdered,
  UserPlus,
  Heart,
  DollarSign,
  ClipboardList,
  Zap,
  Award,
  FlaskConical,
  Lock,
  ToggleRight,
  Download,
  Globe,
  Settings,
  BarChart3,
  FileDown,
  Factory,
  Layers,
  BadgeCheck,
  MapPin,
  MapPinned,
  Megaphone,
  BellRing,
  Shield,
  Share2,
  FileQuestion,
  MessageSquareReply,
} from 'lucide-react';

/** Single navigable item (translated via `labelKey`). */
export interface SidebarNavItem {
  labelKey: string;
  path: string;
  icon: LucideIcon;
}

/** Group heading + items. */
export interface SidebarNavSection {
  sectionKey: string;
  items: SidebarNavItem[];
}

/**
 * Full admin sidebar structure aligned with API modules and routes.
 * Labels are resolved with `t('sidebar.<labelKey>')` and sections with `t('sidebar.section.<sectionKey>')`.
 */
export const SIDEBAR_NAV_SECTIONS: SidebarNavSection[] = [
  {
    sectionKey: 'overview',
    items: [{ labelKey: 'dashboard', path: '/', icon: LayoutDashboard }],
  },
  {
    sectionKey: 'usersOrg',
    items: [
      { labelKey: 'users', path: '/users', icon: Users },
      { labelKey: 'companies', path: '/companies', icon: Briefcase },
      { labelKey: 'roles', path: '/roles', icon: Shield },
    ],
  },
  {
    sectionKey: 'catalog',
    items: [
      { labelKey: 'products', path: '/products', icon: Boxes },
      { labelKey: 'services', path: '/services', icon: FileCode },
      { labelKey: 'tags', path: '/tags', icon: TagsIcon },
      { labelKey: 'tagProposals', path: '/tag-proposals', icon: Tag },
      { labelKey: 'media', path: '/media', icon: Image },
    ],
  },
  {
    sectionKey: 'taxonomies',
    items: [
      { labelKey: 'industries', path: '/industries', icon: Factory },
      { labelKey: 'categories', path: '/categories', icon: Layers },
      { labelKey: 'expertises', path: '/expertises', icon: BadgeCheck },
    ],
  },
  {
    sectionKey: 'discovery',
    items: [
      { labelKey: 'searchIndex', path: '/search', icon: SearchIcon },
      { labelKey: 'analytics', path: '/analytics', icon: BarChart3 },
      { labelKey: 'analyticsExport', path: '/analytics-export', icon: FileDown },
    ],
  },
  {
    sectionKey: 'engagement',
    items: [
      { labelKey: 'reviews', path: '/reviews', icon: Star },
      { labelKey: 'curatedLists', path: '/curated-lists', icon: ListOrdered },
      { labelKey: 'follows', path: '/follows', icon: UserPlus },
      { labelKey: 'likes', path: '/likes', icon: Heart },
    ],
  },
  {
    sectionKey: 'monetization',
    items: [
      { labelKey: 'plans', path: '/plans', icon: DollarSign },
      { labelKey: 'subscriptions', path: '/subscriptions', icon: ClipboardList },
      { labelKey: 'features', path: '/features', icon: Zap },
      { labelKey: 'sponsorships', path: '/sponsorships', icon: Award },
      { labelKey: 'sponsoredAds', path: '/sponsored-ads', icon: Megaphone },
    ],
  },
  {
    sectionKey: 'quotes',
    items: [
      { labelKey: 'quoteRequests', path: '/quote-requests', icon: FileQuestion },
      { labelKey: 'quoteResponses', path: '/quote-responses', icon: MessageSquareReply },
    ],
  },
  {
    sectionKey: 'operations',
    items: [
      { labelKey: 'experiments', path: '/experiments', icon: FlaskConical },
      { labelKey: 'entitlements', path: '/entitlements', icon: Lock },
      { labelKey: 'featureOverrides', path: '/feature-overrides', icon: ToggleRight },
    ],
  },
  {
    sectionKey: 'dataGeo',
    items: [
      { labelKey: 'imports', path: '/imports', icon: Download },
      { labelKey: 'googlePlaces', path: '/google-places', icon: MapPin },
      { labelKey: 'placesLookup', path: '/places', icon: MapPinned },
    ],
  },
  {
    sectionKey: 'platform',
    items: [
      { labelKey: 'platform', path: '/platform', icon: Globe },
      { labelKey: 'globalNotifications', path: '/global-notifications', icon: BellRing },
      { labelKey: 'socialPlatforms', path: '/social-platforms', icon: Share2 },
    ],
  },
  {
    sectionKey: 'system',
    items: [{ labelKey: 'settings', path: '/settings', icon: Settings }],
  },
];
