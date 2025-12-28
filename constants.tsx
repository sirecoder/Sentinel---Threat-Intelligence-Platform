
import React from 'react';
import { IoCRecord, ThreatFeed, AnomalyEvent, DashboardStats, ThreatCampaign } from './types';

export const MOCK_STATS: DashboardStats = {
  totalIoCs: 124508,
  activeThreats: 1242,
  activeFeeds: 18,
  alerts24h: 342,
};

export const MOCK_IOCS: IoCRecord[] = [
  {
    id: '1',
    value: '192.168.1.105',
    type: 'IP',
    threatLevel: 'High',
    confidence: 88,
    lastSeen: '2023-11-20T14:30:00Z',
    tags: ['Cobalt Strike', 'C2'],
    status: 'Active',
    description: 'Known C2 beaconing address observed in recent campaign.'
  },
  {
    id: '2',
    value: 'evil-domain-example.com',
    type: 'Domain',
    threatLevel: 'Critical',
    confidence: 95,
    lastSeen: '2023-11-20T12:00:00Z',
    tags: ['Phishing', 'Credential Theft'],
    status: 'Active',
    description: 'Active phishing domain targeting financial institutions.'
  }
];

export const MOCK_FEEDS: ThreatFeed[] = [
  {
    id: 'f1',
    name: 'AlienVault OTX',
    url: 'https://otx.alienvault.com/api/v1',
    type: 'API',
    status: 'Healthy',
    lastUpdate: '5 mins ago',
    trustScore: 92
  }
];

export const MOCK_ANOMALIES: AnomalyEvent[] = [
  {
    id: 'a1',
    timestamp: '2023-11-20T15:00:00Z',
    source: 'Edge Router Alpha',
    score: 0.94,
    description: 'Sudden spike in outbound traffic to unusual port 4444.',
    status: 'New'
  }
];

export const MOCK_CAMPAIGNS: ThreatCampaign[] = [
  {
    id: 'c1',
    name: 'Operation Silver Fox',
    actor: 'APT29 (Cozy Bear)',
    actorType: 'Nation-State',
    motivation: 'Espionage',
    severity: 'Critical',
    status: 'Active',
    events: [
      { id: 'e1', timestamp: '2023-11-18T09:00:00Z', stage: 'Reconnaissance', title: 'Network Scanning', description: 'Port scanning detected originating from known APT29 infrastructure.' },
      { id: 'e2', timestamp: '2023-11-19T11:30:00Z', stage: 'Delivery', title: 'Spearphishing Campaign', description: 'Targeted emails sent to HR department with malicious XLSM attachments.', iocRelated: 'invoice_992.xlsm' },
      { id: 'e3', timestamp: '2023-11-19T14:00:00Z', stage: 'Exploitation', title: 'Macro Execution', description: 'PowerShell script execution detected on Workstation-14 following document open.' },
      { id: 'e4', timestamp: '2023-11-20T10:00:00Z', stage: 'C2', title: 'Beaconing Established', description: 'Outbound HTTPS traffic to encrypted C2 server identified.', iocRelated: '192.168.1.105' }
    ]
  },
  {
    id: 'c2',
    name: 'DarkGate Ransomware Surge',
    actor: 'Unknown (Fin7 Suspected)',
    actorType: 'Cybercrime',
    motivation: 'Financial Gain',
    severity: 'High',
    status: 'Monitored',
    events: [
      { id: 'e5', timestamp: '2023-11-15T18:00:00Z', stage: 'Weaponization', title: 'Malware Staging', description: 'New DarkGate samples detected in OSINT feeds matching internal telemetry.' },
      { id: 'e6', timestamp: '2023-11-20T13:45:00Z', stage: 'Delivery', title: 'Drive-by Download', description: 'User redirected to compromised WordPress site hosting downloader.' }
    ]
  }
];

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  text: '#94a3b8'
};
