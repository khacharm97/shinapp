export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatarUrl?: string;
  isBlocked?: boolean;
  userInfo?: Record<string, unknown>; // Master specific info
  portfolios?: Portfolio[];
  brigades?: Brigade[];
  [key: string]: unknown;
}

export type ConversationType = "USER_MASTER" | "MASTER_COMPANY" | "SUPPORT";
export type ConversationStatus = "OPEN" | "RESOLVED";

export interface ChatParticipant {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  roles?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: { id: string; name?: string | null; avatarUrl?: string | null };
  body: string;
  attachments: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  status?: ConversationStatus;
  announcementId?: string | null;
  orderId?: string | null;
  lastMessageAt: string;
  otherParticipants: ChatParticipant[];
  lastMessage?: ChatMessage | null;
  unreadCount: number;
}

export interface LocalizedString {
  name?: string;
  nameEn?: string;
  nameRu?: string;
  nameAm?: string;
  nameFa?: string;
}

export interface Skill extends LocalizedString {
  id: string;
  key: string;
  icon?: string;
  color?: string | null;
}

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[];
}

export interface BrigadeMember {
  id: string;
  userId: string;
  user: User;
  role: string;
  status: string;
}

export interface Brigade {
  id: string;
  name: string;
  about?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: BrigadeMember[];
  owner?: User; // Adding this for the GET /brigades/:id endpoint
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type TechniquePriceType = "HOURLY" | "FIXED";

export interface Technique {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  imageUrls: string[];
  priceType: TechniquePriceType;
  price: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    userInfo?: { regionId?: string | null; cityId?: string | null } | null;
  };
}

export interface Master {
  id: string;
  name?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  userInfo?: {
    skills?: string[];
    regionId?: string;
    cityId?: string;
    priceValue?: string;
    pricingFormat?: string;
    about?: string;
    largeScale?: boolean;
    urgentOrders?: boolean;
    onlinePay?: boolean;
    buyMaterial?: boolean;
    nightShift?: boolean;
    multipleJobs?: boolean;
    website?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialTiktok?: string;
    itn?: string;
    workersCount?: number | string;
    workingPlaces?: string[];
    [key: string]: unknown;
  };
  portfolios?: Portfolio[];
  brigades?: Brigade[];
  rating?: number;
  reviewsCount?: number;
  /** Live availability derived from current in-progress orders. */
  availability?: "AVAILABLE" | "HALF_BUSY" | "BUSY";
  /** Whether this master currently has the app open (a live socket connected). */
  isOnline?: boolean;
  [key: string]: unknown;
}
