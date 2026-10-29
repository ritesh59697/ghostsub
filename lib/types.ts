export type SubscriptionStatus = 'FLAT_ACTIVE' | 'SUI_MPP_STREAM' | 'DORMANT_PAUSED' | 'KILLED';
export type BillingPreference = 'keep_access' | 'pause_when_idle';

export interface Subscription {
  id: string;
  name: string;
  category: 'AI & ML' | 'Infrastructure' | 'Media & Entertainment' | 'Data & Research' | 'Developer Tools';
  description: string;
  iconName: string;
  flatMonthlyRate: number; // in USD
  mppRatePerUnit: number; // in USDC on Sui
  mppUnitName: string; // e.g. "per inference", "per active hour", "per gigabyte"
  status: SubscriptionStatus;
  efficiencyScore: number; // 0 to 100%
  daysMonitored: number;
  totalSessions: number;
  lastActiveDay: number;
  totalUnitsConsumed: number;
  totalFlatSpent: number;
  totalMppSpent: number;
  totalSaved: number;
  memoryCount: number;
  thresholdEfficiency: number; // default 20%
}

export interface MemoryEntry {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  day: number;
  timestamp: string;
  type: 'OBSERVATION' | 'ALERT' | 'POLICY_CHANGE' | 'PAYMENT_EVENT' | 'USER_PREFERENCE' | 'SIMULATION_EVENT';
  content: string;
  walrusBlobId: string;
  walrusJobId?: string;
  isMainnetVerified: boolean;
  source?: 'sample' | 'local' | 'walrus-mainnet';
  demoProfileId?: string;
  actionTaken?: string;
  suiTxDigest?: string;
}

export interface MppPaymentEvent {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  day: number;
  timestamp: string;
  amountUsdc: number;
  units: number;
  unitType: string;
  suiTxDigest: string;
  gasFeeSui: number;
  status: 'CONFIRMED' | 'STREAMING';
  blockCheckpoint: number;
}

export interface SimulationStep {
  day: number;
  description: string;
  activityDetected: boolean;
  activeServiceId?: string;
  unitsAdded?: number;
  triggeredEvent?: 'SWITCH_TO_MPP' | 'WARNING' | 'RETAIN_STREAM' | 'RESURGE_ALERT';
}

export interface TatumStatus {
  online: boolean;
  network: string;
  checkpointSequence: number;
  rpcLatencyMs: number;
  gateway: string;
}

export interface WalrusStatus {
  online: boolean;
  writeReady: boolean;
  relayerUrl: string;
  accountId: string;
  agentId: string;
  totalMemoriesStored: number;
}
