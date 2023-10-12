import { Conversation } from '@/types/agent/chat';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredConversations: Conversation[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredConversations: [],
};
