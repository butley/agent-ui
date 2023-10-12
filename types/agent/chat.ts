import { UserEntity } from "@/types/agent/models";


export interface Message {
  role: Role;
  content: string;
  timestamp?: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  messages: Message[];
  key?: string;
  prompt?: string;
  temperature?: number;
}

export interface Conversation {
  id?: number;
  name: string;
  messages: Message[];
  folderId: string | null;
  user: UserEntity;
}
