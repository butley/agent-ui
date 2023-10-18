import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import axiosRetry from 'axios-retry';
import { BillingCycleEntity, ChatMessageEntity, convertChatMessagesToMessages, UserEntity } from '@/types/agent/models';
import {Conversation} from '@/types/agent/chat';
import { handleError } from "@/services/apiErrorHandling";
import toast from "react-hot-toast";
import { t } from "i18next";

export type ChatHttpConfig = {
    url: string;
    method?: string;
} & AxiosRequestConfig;

type HTTP = {
    get<T = unknown, R = AxiosResponse<T>>(config: ChatHttpConfig): Promise<R>;
    post<T = unknown, R = AxiosResponse<T>>(
        config: ChatHttpConfig,
        data?: unknown,
    ): Promise<R>;
    put<T = unknown, R = AxiosResponse<T>>(
        config: ChatHttpConfig,
        data?: unknown,
    ): Promise<R>;
    delete<T = unknown, R = AxiosResponse<T>>(
        config: ChatHttpConfig,
        data?: unknown,
    ): Promise<R>;
};

export const requestInterceptor = (value: AxiosRequestConfig) => {
    //const requestHash = value.headers && (value.headers['Authentication-Hash'] as string)
    return value;
};
axios.interceptors.request.use(requestInterceptor);
axiosRetry(axios, {retries: 0});

export const chatClient: HTTP = {
    get: (config) => {
        return axios.request({
            method: 'get',
            responseType: 'json',
            baseURL: process.env.NEXT_PUBLIC_BUTLEY_API_HOST,
            ...config,
        });
    },
    post: (config, payload) => {
        return axios.request({
            method: 'post',
            responseType: 'json',
            baseURL: process.env.NEXT_PUBLIC_BUTLEY_API_HOST,
            data: payload,
            ...config,
        });
    },
    put: (config, payload) => {
        return axios.request({
            method: 'put',
            responseType: 'json',
            baseURL: process.env.NEXT_PUBLIC_BUTLEY_API_HOST,
            data: payload,
            ...config,
        });
    },
    delete: (config, payload) => {
        return axios.request({
            method: 'delete',
            responseType: 'json',
            baseURL: process.env.NEXT_PUBLIC_BUTLEY_API_HOST,
            data: payload,
            ...config,
        });
    },
};

export const markUnreadMessagesAsRead = (userId: number, chatMessages: ChatMessageEntity[], conversation: Conversation) => {
    // Check if there are any unread messages
    const hasUnreadMessages = chatMessages.some(msg => msg.userUnread === true);

    // If there are unread messages, mark them as read
    if (hasUnreadMessages) {
        console.log('Marking messages as read: ', chatMessages.length);
        markAllMessagesAsRead(userId, conversation.id!!).catch(error => {
            toast.error(t('Error marking messages as read: ' + (error.response?.data?.errorMessage || error.message)));
        });
    }
};

export const fetchUnreadMessages = async (userId: number, conversation: Conversation): Promise<number> => {
    try {
        console.log('Fetching unread messages');
        const response = await getUnreadMessages(userId, conversation?.id!!);
        const chatMessages = response.data;

        if (chatMessages.length === 0) {
            return 0;  // Return 0 if there are no unread messages
        }

        console.log("Unread messages:", chatMessages);

        const newMessages = convertChatMessagesToMessages(chatMessages);

        markUnreadMessagesAsRead(userId, chatMessages, conversation);  // Assume this is an async function

        const updatedMessages = conversation.messages;
        conversation.messages = [...updatedMessages, ...newMessages];

        return chatMessages.length;  // Return the count of unread messages
    } catch (error) {
        handleError(error, t('Not possible to fetch unread messages.'));
        return 0;  // Return 0 in case of an error
    }
}

// API CALLS  ----------------------------------------------

export const createUser = async (user: UserEntity) =>
    chatClient.post<UserEntity>({
        url: '/users'
    }, user);

export const getUserByEmail = async (email: string) =>
    chatClient.get<UserEntity>({
        url: `/users/by-email/${email}`,
    });

export const emailExists = async (email: string) =>
    chatClient.get<UserEntity>({
        url: `/users/email-exists/${email}`,
    });

export const upsertConversation = async (conversation: Conversation): Promise<AxiosResponse<Conversation>> =>
    chatClient.post<Conversation>(
        {
            url: `/chat/conversation`,
        },
        conversation,
    );

export const getConversations = async (userId: number): Promise<AxiosResponse<Conversation[]>> =>
    chatClient.get<Conversation[]>({
        url: `/chat/conversation/${userId}`,
    });

export const deleteConversation = async (conversationId: number) =>
    chatClient.delete({
        url: `/chat/conversation/${conversationId}`,
    });

export const createMessage = async (chatMessageEntity: ChatMessageEntity): Promise<AxiosResponse<ChatMessageEntity>> =>
    chatClient.post(
        {
            url: `/chat/messages`,
        },
        chatMessageEntity,
    );

export const markAllMessagesAsRead = async (userId: number, conversationId: number) =>
    chatClient.post({
        url: `/chat/messages/read/${userId}/${conversationId}`,
    });

export const getMessagesByConversationId = async (
    conversationId: number,
    userId: number,
): Promise<AxiosResponse<ChatMessageEntity[]>> =>
    chatClient.get<ChatMessageEntity[]>({
        url: `/chat/messages/conversation/${conversationId}/${userId}`,
    });

export const getOpenBillingCycle = async (ownerId: number): Promise<AxiosResponse<BillingCycleEntity>> =>
    chatClient.get<BillingCycleEntity>({
        url: `/billing/cycle/${ownerId}`,
    });

export const getUnreadMessages = (userId: number, conversationId: number): Promise<AxiosResponse<ChatMessageEntity[]>> =>
    chatClient.get<ChatMessageEntity[]>({
        url: `/chat/messages/unread/${userId}/${conversationId}`,
    });


export const getAgentHostUrl = async (userId: number, agentId: number): Promise<AxiosResponse<string>> =>
    chatClient.get({
        url: `/agents/host-url/${userId}/${agentId}`,
    });


// AGENT FUNCTIONS  ----------------------------------------------

export const postAgentMessage = async (endpoint: string, body: string, token: string) =>
    await fetch(`${endpoint}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body,
    });