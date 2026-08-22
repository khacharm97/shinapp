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
  [key: string]: unknown;
}
