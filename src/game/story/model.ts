export const storyRooms = ['mcgill', 'nortel', 'smart', 'lightspeed', 'shopify'] as const;
export type StoryRoomId = typeof storyRooms[number];

export const itemNames = {
  'power-lead': 'spare power lead', gum: 'gum', 'chewed-gum': 'chewed gum',
  recommendation: 'printed recommendation', 'paper-plane': 'paper plane',
  'guitar-pick': 'guitar pick', 'retaining-clip': 'retaining clip', 'sticky-clip': 'sticky clip',
  strap: 'anti-static strap', stylus: 'stylus', 'faulty-receipt': 'faulty receipt',
  'checkout-plan': 'checkout sketch', 'test-receipt': 'test receipt',
} as const;
export type StoryItem = keyof typeof itemNames;
export const isStoryItem = (item: string): item is StoryItem => Object.hasOwn(itemNames, item);

export const storyFlags = [
  'powerLeadTaken', 'computerPowered', 'gumTaken', 'drawerOpen', 'clipTaken', 'stylusDown',
  'strapWorn', 'clipMounted', 'linkRestored', 'exampleOnBoard', 'agentHasPlan', 'agentHasExample', 'reviewComplete',
] as const;
export type StoryFlag = typeof storyFlags[number];

export type Sale = Readonly<{ quantity: number; unitPriceCents: number; totalCents: number }>;
export type Candidate = Readonly<{ id: number }>;
export type TestReceipt = Readonly<{ candidateId: number; sale: Sale }>;
export type AgentEvidence = Readonly<{ candidate: Candidate | null; receipt: TestReceipt | null }>;

/** The puzzle's persistent slice; the adventure owner supplies room positions and navigation. */
export type StoryProgress = Readonly<{
  inventory: readonly StoryItem[];
  flags: Readonly<Record<StoryFlag, boolean>>;
  agent: AgentEvidence;
  completed: boolean;
}>;

/** Timers, shock and terminal visibility belong to a mounted room, never a save. */
export type StoryRoomState = Readonly<{ tripped: boolean; computerOpen: boolean }>;
export const initialStoryRoom = (): StoryRoomState => ({ tripped: false, computerOpen: false });

export const films = ['Back to the Future', 'The Princess Bride', 'Alien'] as const;
export type Film = typeof films[number];
export type StoryAction =
  | { type: 'rate-film'; film: Film; rating: 1 | 2 | 3 | 4 | 5 }
  | { type: 'close-computer' }
  | { type: 'reset-equipment' }
  | { type: 'inspect-item'; item: string };

export const faultySale: Sale = { quantity: 2, unitPriceCents: 300, totalCents: 300 };
export const independentSale = { quantity: 3, unitPriceCents: 300 } as const;
export const calculateTotal = (sale: Pick<Sale, 'quantity' | 'unitPriceCents'>): number => sale.quantity * sale.unitPriceCents;

export function verifiesCandidate(agent: AgentEvidence): boolean {
  const { candidate, receipt } = agent;
  return candidate !== null && receipt !== null && receipt.candidateId === candidate.id
    && receipt.sale.quantity === independentSale.quantity && receipt.sale.unitPriceCents === independentSale.unitPriceCents
    && receipt.sale.totalCents === calculateTotal(independentSale);
}
