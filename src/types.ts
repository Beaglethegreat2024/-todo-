export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface BeadPet {
  name: string;
  description: string;
  gridSize: number; // e.g. 16 or 24 or 32
  // grid represents colors: hex strings or null for transparent
  beadGrid: (string | null)[][];
  originalImage?: string; // Base64 or URL
  activeOutfitId: string | null;
  useOriginalImage?: boolean;
  hunger?: number; // 0 to 100
  lastInteracted?: number; // timestamp
}

export interface GachaItem {
  id: string;
  type: 'outfit' | 'decoration';
  name: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  rarity: 'common' | 'rare' | 'epic';
  color: string; // Color coding for UI
  // Specific style or styling variables
  assetType?: 'hat' | 'glasses' | 'clothing' | 'accessory' | 'furniture' | 'wallpaper' | 'plant' | 'toy';
}

export interface PlacedDecoration {
  id: string;
  decorationId: string;
  x: number; // Percentage from left (0 to 100)
  y: number; // Percentage from top (0 to 100)
}

export interface AppState {
  tasks: Task[];
  tickets: number;
  unlockedOutfits: string[]; // GachaItem IDs
  unlockedDecorations: string[]; // GachaItem IDs
  placedDecorations: PlacedDecoration[];
  activeOutfitId: string | null;
  pet: BeadPet | null;
  gachaHistory: { itemId: string; timestamp: string }[];
}
