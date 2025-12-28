
export type IoCType = 'IP' | 'Domain' | 'Hash' | 'URL' | 'Email';

export interface IoCRecord {
  id: string;
  value: string;
  type: IoCType;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  lastSeen: string;
  tags: string[];
  status: 'Active' | 'Expired' | 'Whitelisted';
  description?: string;
}

export interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  type: 'RSS' | 'TAXII' | 'API' | 'Manual';
  status: 'Healthy' | 'Error' | 'Syncing';
  lastUpdate: string;
  trustScore: number;
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  source: string;
  score: number;
  description: string;
  status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
}

export interface DashboardStats {
  totalIoCs: number;
  activeThreats: number;
  activeFeeds: number;
  alerts24h: number;
}

export interface CampaignEvent {
  id: string;
  timestamp: string;
  stage: 'Reconnaissance' | 'Weaponization' | 'Delivery' | 'Exploitation' | 'Installation' | 'C2' | 'Actions on Objectives';
  title: string;
  description: string;
  iocRelated?: string;
}

export interface ThreatCampaign {
  id: string;
  name: string;
  actor: string;
  actorType: string;
  motivation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Contained' | 'Monitored';
  events: CampaignEvent[];
}
