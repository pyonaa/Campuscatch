interface Item {
  id: string;
  name: string;
  category: string;
  location: string;
  dateFound: string;
  description: string;
  status: string;
  imageUrls?: string[];
  userId: string;
  userName: string;
  createdAt: string;
  archived?: boolean;
  claimedBy?: string;
  claimedByUserId?: string;
  ownerWants?: string;
  ownerWantsNotes?: string;
  acceptedOfferId?: string;
  /** DEMO ONLY — simulates the 2-month unclaimed state without modifying createdAt */
  _demoUnclaimedFlag?: boolean;
}

interface Offer {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  offering: string;
  offerDetails?: string;
  createdAt: string;
  accepted: boolean;
}

interface Notification {
  id: string;
  type: 'claim_request' | 'claim_approved' | 'claim_rejected' | 'unclaimed_alert';
  itemId: string;
  itemName: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
  claimantName?: string;
}

const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    name: "iPhone 13 Pro",
    category: "electronics",
    location: "library",
    dateFound: "2026-04-18",
    description: "Black iPhone 13 Pro found on the third floor near the study area. Has a cracked screen protector.",
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=600&fit=crop"],
    userId: "user-1",
    userName: "John Doe",
    createdAt: "2026-04-18T10:30:00Z",
  },
  {
    id: "2",
    name: "Blue Backpack",
    category: "bags",
    location: "student-center",
    dateFound: "2026-04-17",
    description: "Navy blue JanSport backpack with math textbooks inside. Found near the cafeteria entrance.",
    status: "Pending",
    imageUrls: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop"],
    userId: "user-2",
    userName: "Jane Smith",
    createdAt: "2026-04-17T14:20:00Z",
  },
  {
    id: "3",
    name: "Airpods Pro",
    category: "electronics",
    location: "gym",
    dateFound: "2026-04-19",
    description: "White Airpods Pro with charging case. Found in the locker room.",
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=600&fit=crop"],
    userId: "user-1",
    userName: "John Doe",
    createdAt: "2026-04-19T09:15:00Z",
  },
  {
    id: "4",
    name: "Red Water Bottle",
    category: "other",
    location: "cafeteria",
    dateFound: "2026-04-16",
    description: "Hydro Flask water bottle, bright red color. Has some stickers on it.",
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop"],
    userId: "user-3",
    userName: "Mike Johnson",
    createdAt: "2026-04-16T16:45:00Z",
  },
  {
    id: "5",
    name: "MacBook Air",
    category: "electronics",
    location: "classroom",
    dateFound: "2026-04-15",
    description: "Silver MacBook Air 2020 model. Found in Room 205 after class.",
    status: "Returned",
    imageUrls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"],
    userId: "user-2",
    userName: "Jane Smith",
    createdAt: "2026-04-15T11:00:00Z",
    claimedBy: "Demo User",
    claimedByUserId: "mock-user-id",
  },
  {
    id: "7",
    name: "Yellow Snapback Cap",
    category: "clothing",
    location: "library",
    dateFound: "2026-04-10",
    description: "Yellow snapback cap with a university logo. Found on a study desk on the second floor.",
    status: "Available",
    imageUrls: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=600&fit=crop"],
    userId: "mock-user-id",
    userName: "Demo User",
    createdAt: "2026-04-10T09:00:00Z",
    archived: false,
  },
  {
    id: "6",
    name: "Black Umbrella",
    category: "accessories",
    location: "parking",
    dateFound: "2026-04-14",
    description: "Large black umbrella with wooden handle. Left in parking structure level 2.",
    status: "Auction",
    imageUrls: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"],
    userId: "user-3",
    userName: "Mike Johnson",
    createdAt: "2026-02-10T08:30:00Z",
    archived: false,
    ownerWants: "Coffee or snacks",
    ownerWantsNotes: "Preferably coffee from the campus café or some cookies/donuts",
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "claim_request",
    itemId: "1",
    itemName: "iPhone 13 Pro",
    message: "Sarah Johnson has submitted a claim for your iPhone 13 Pro",
    createdAt: "2026-04-19T15:30:00Z",
    read: false,
    userId: "user-1",
    claimantName: "Sarah Johnson",
  },
  {
    id: "2",
    type: "unclaimed_alert",
    itemId: "6",
    itemName: "Black Umbrella",
    message: "Your Black Umbrella has been unclaimed for 2 months. What would you like to do?",
    createdAt: "2026-04-18T10:00:00Z",
    read: false,
    userId: "user-3",
  },
  {
    id: "3",
    type: "claim_approved",
    itemId: "5",
    itemName: "MacBook Air",
    message: "Your claim for MacBook Air has been approved",
    createdAt: "2026-04-17T12:00:00Z",
    read: true,
    userId: "mock-user-id",
  },
];

const MOCK_OFFERS: Offer[] = [
  {
    id: "1",
    itemId: "6",
    userId: "user-2",
    userName: "Jane Smith",
    offering: "Box of donuts",
    offerDetails: "Fresh glazed donuts from the campus bakery",
    createdAt: "2026-04-19T14:00:00Z",
    accepted: false,
  },
  {
    id: "2",
    itemId: "6",
    userId: "user-1",
    userName: "John Doe",
    offering: "Coffee gift card",
    offerDetails: "$10 Starbucks gift card",
    createdAt: "2026-04-19T16:30:00Z",
    accepted: false,
  },
];

let mockItemsStore = [...MOCK_ITEMS];
let mockNotificationsStore = [...MOCK_NOTIFICATIONS];
let mockOffersStore = [...MOCK_OFFERS];
let nextId = 8;
let nextNotificationId = 4;
let nextOfferId = 3;

export const mockApi = {
  getAllItems: async (): Promise<{ items: Item[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { items: mockItemsStore.filter(item => !item.archived) };
  },

  getItem: async (id: string): Promise<Item | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockItemsStore.find(item => item.id === id) || null;
  },

  getMyItems: async (): Promise<{ posted: Item[], claimed: Item[], archived: Item[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const posted = mockItemsStore.filter(item =>
      item.userId === "mock-user-id" &&
      !item.archived &&
      item.status !== "Auction" &&
      item.status !== "Completed"
    );
    const claimed = mockItemsStore.filter(item => item.id === "2" || item.id === "5");
    const archived = mockItemsStore.filter(item => item.userId === "mock-user-id" && item.archived);
    return { posted, claimed, archived };
  },

  getUserItems: async (userId: string): Promise<{ posted: Item[], claimed: Item[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const posted = mockItemsStore.filter(item => item.userId === userId && !item.archived);
    const claimed = mockItemsStore.filter(item => item.id === "2" || item.id === "5");
    return { posted, claimed };
  },

  createItem: async (itemData: {
    name: string;
    category: string;
    location: string;
    dateFound: string;
    description: string;
    imageUrls: string[];
  }): Promise<Item> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newItem: Item = {
      id: String(nextId++),
      name: itemData.name,
      category: itemData.category,
      location: itemData.location,
      dateFound: itemData.dateFound,
      description: itemData.description,
      status: "Available",
      imageUrls: itemData.imageUrls,
      userId: "mock-user-id",
      userName: "Demo User",
      createdAt: new Date().toISOString(),
      archived: false,
    };

    mockItemsStore = [newItem, ...mockItemsStore];
    return newItem;
  },

  updateItem: async (id: string, itemData: Partial<Item>): Promise<Item | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockItemsStore.findIndex(item => item.id === id);
    if (index !== -1) {
      mockItemsStore[index] = { ...mockItemsStore[index], ...itemData };
      return mockItemsStore[index];
    }
    return null;
  },

  deleteItem: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockItemsStore.findIndex(item => item.id === id);
    if (index !== -1) {
      mockItemsStore = mockItemsStore.filter(item => item.id !== id);
      return true;
    }
    return false;
  },

  archiveItem: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockItemsStore.findIndex(item => item.id === id);
    if (index !== -1) {
      mockItemsStore[index].archived = true;
      return true;
    }
    return false;
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  },

  getNotifications: async (): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotificationsStore.filter(n => n.userId === "mock-user-id");
  },

  markNotificationAsRead: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = mockNotificationsStore.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  },

  getUnreadCount: async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockNotificationsStore.filter(n => !n.read && n.userId === "mock-user-id").length;
  },

  submitClaim: async (itemId: string, claimData: { whenLost: string; uniqueDetail: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const item = mockItemsStore.find(i => i.id === itemId);
    if (item) {
      item.status = "Pending";

      const notification: Notification = {
        id: String(nextNotificationId++),
        type: "claim_request",
        itemId: itemId,
        itemName: item.name,
        message: `Demo User has submitted a claim for your ${item.name}`,
        createdAt: new Date().toISOString(),
        read: false,
        userId: item.userId,
        claimantName: "Demo User",
      };
      mockNotificationsStore = [notification, ...mockNotificationsStore];

      return true;
    }
    return false;
  },

  handleUnclaimedAction: async (itemId: string, action: 'keep' | 'auction' | 'archive', auctionData?: { ownerWants: string; ownerWantsNotes?: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const item = mockItemsStore.find(i => i.id === itemId);
    if (item) {
      item._demoUnclaimedFlag = false; // clear demo flag when action is taken
      if (action === 'archive') {
        item.archived = true;
      } else if (action === 'auction' && auctionData) {
        item.status = "Auction";
        item.ownerWants = auctionData.ownerWants;
        item.ownerWantsNotes = auctionData.ownerWantsNotes;
      }

      mockNotificationsStore = mockNotificationsStore.filter(
        n => !(n.itemId === itemId && n.type === 'unclaimed_alert')
      );

      return true;
    }
    return false;
  },

  getAuctionItems: async (): Promise<Item[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockItemsStore.filter(item => item.status === "Auction");
  },

  getAuctionItem: async (id: string): Promise<Item | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockItemsStore.find(item => item.id === id && item.status === "Auction");
    return item || null;
  },

  getOffers: async (itemId: string): Promise<Offer[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOffersStore.filter(offer => offer.itemId === itemId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  submitOffer: async (itemId: string, offerData: { offering: string; offerDetails?: string }): Promise<Offer> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newOffer: Offer = {
      id: String(nextOfferId++),
      itemId: itemId,
      userId: "mock-user-id",
      userName: "Demo User",
      offering: offerData.offering,
      offerDetails: offerData.offerDetails,
      createdAt: new Date().toISOString(),
      accepted: false,
    };

    mockOffersStore = [newOffer, ...mockOffersStore];

    const item = mockItemsStore.find(i => i.id === itemId);
    if (item) {
      const notification: Notification = {
        id: String(nextNotificationId++),
        type: "claim_request",
        itemId: itemId,
        itemName: item.name,
        message: `Demo User submitted an offer for your ${item.name} in CampusAuction`,
        createdAt: new Date().toISOString(),
        read: false,
        userId: item.userId,
      };
      mockNotificationsStore = [notification, ...mockNotificationsStore];
    }

    return newOffer;
  },

  // ─── DEMO ONLY ─────────────────────────────────────────────────────────────
  // Simulates the 2-month unclaimed alert for a presentation without touching
  // real createdAt dates or real notification logic.
  simulateDemoUnclaimedNotification: async (): Promise<{ itemId: string; notificationId: string } | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Always prefer item "7" (Yellow Snapback Cap) — owned by mock-user-id
    // so ItemDetails correctly shows the owner-only unclaimed action panel.
    // Fall back to any other Available item owned by mock-user-id.
    const preferredItem = mockItemsStore.find(
      i => i.id === '7' && i.status === 'Available' && !i.archived
    );
    const fallbackItem = mockItemsStore.find(
      i => i.userId === 'mock-user-id' && i.status === 'Available' && !i.archived
    );
    const target = preferredItem ?? fallbackItem ?? null;
    if (!target) return null;

    // Set the demo flag on the item so ItemDetails shows the unclaimed panel
    target._demoUnclaimedFlag = true;

    // Remove any prior demo notification for this item to avoid duplicates
    mockNotificationsStore = mockNotificationsStore.filter(
      n => !(n.itemId === target.id && n.type === 'unclaimed_alert' && n.userId === 'mock-user-id')
    );

    const demoNotification: Notification = {
      id: String(nextNotificationId++),
      type: 'unclaimed_alert',
      itemId: target.id,
      itemName: target.name,
      message: `[DEMO] Your "${target.name}" has been unclaimed for 2 months. What would you like to do?`,
      createdAt: new Date().toISOString(),
      read: false,
      userId: 'mock-user-id',
    };

    mockNotificationsStore = [demoNotification, ...mockNotificationsStore];
    return { itemId: target.id, notificationId: demoNotification.id };
  },
  // ─────────────────────────────────────────────────────────────────────────

  acceptOffer: async (offerId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const offer = mockOffersStore.find(o => o.id === offerId);
    if (offer) {
      offer.accepted = true;
      const item = mockItemsStore.find(i => i.id === offer.itemId);
      if (item) {
        item.status = "Completed";
        item.acceptedOfferId = offerId;
      }
      return true;
    }
    return false;
  },
};
