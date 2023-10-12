import {Conversation, Message} from '@/types/agent/chat';

export interface UserEntity {
  id?: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  provider?: 'GOOGLE' | 'MICROSOFT' | 'NONE';
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface ChatMessageEntity {
  id?: number;
  created?: string;
  userContent?: string;
  userDateTime?: string;
  user?: UserEntity;
  chatTransactionId?: number;
  conversation: Conversation;
  userUnread?: boolean;
  agentContent?: string;
  agentDateTime?: string;
}

export interface BillingCycleEntity {
  date?: string;
  created?: string;
  tokensTotal: number;
  rate: number;
}

export interface PortalUser {
  clientId?: string;
  clientSecret?: string;
  clientName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  idToken?: string;
  picture?: string;
  id?: number;
}

export function convertChatMessagesToMessages(
    entities: ChatMessageEntity[] | null | undefined,
): Message[] {
  // Return an empty array if entities is null, undefined, or empty
  if (!entities || entities.length === 0) {
    return [];
  }

  return entities.flatMap((entity) => {
    const messages: Message[] = [];

    if (entity.userContent) {
      messages.push({
        role: 'user',
        content: entity.userContent,
        timestamp: entity.created,
      });
    }

    if (entity.agentContent) {
      messages.push({
        role: 'assistant',
        content: entity.agentContent,
        timestamp: entity.created,
      });
    }

    return messages;
  });
}

export function formatDate(rawDate: string, locale = 'en-US', options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  const [year, month, day] = rawDate.split('-');
  const dateObj = new Date(year, month - 1, day);  // month is 0-indexed
  return dateObj.toLocaleDateString(locale, options);
}

export function formatMonthYear(rawDate: string, locale = 'en-US') {
  const [year, month] = rawDate.split('-');
  const dateObj = new Date(year, month - 1);  // month is 0-indexed
  return dateObj.toLocaleDateString(locale, { year: 'numeric', month: 'long' }).replace(" ", "/");
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
