/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  time?: string;
}

export interface AgentSpeaker {
  id: string;
  name: string;
  company: string;
  industry: string;
  description: string;
  features: string[];
  systemInstruction: string;
  avatarUrl: string;
  accentColor: string;
  voiceName: 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';
}

export interface ClientIntegrations {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
}

export enum PageSection {
  HERO = 'hero',
  DEMO = 'demo',
  SPECIALTIES = 'specialties',
  INTEGRATIONS = 'integrations',
  INQUIRY = 'inquiry'
}
