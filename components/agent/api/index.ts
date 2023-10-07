import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import axiosRetry from 'axios-retry';
import {BillingCycleEntity, ChatMessageEntity, UserEntity} from '@/types/agent/models';
import {Conversation} from '@/types/agent/chat';

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

export const upsertConversation = async (conversation: Conversation) =>
    chatClient.post<Conversation>(
        {
            url: `/chat/conversation`,
        },
        conversation,
    );

export const getConversations = async (userId: number) =>
    chatClient.get<Conversation[]>({
        url: `/chat/conversation/${userId}`,
    });

export const deleteConversation = async (conversationId: number) =>
    chatClient.delete({
        url: `/chat/conversation/${conversationId}`,
    });

export const createMessage = async (chatMessageEntity: ChatMessageEntity) =>
    chatClient.post(
        {
            url: `/chat/messages`,
        },
        chatMessageEntity,
    );

export const markAllMessagesAsRead = async (userId: number,conversationId: number, ) =>
    chatClient.post({
        url: `/chat/messages/read/${userId}/${conversationId}`,
    });

export const getMessagesByConversationId = async (
    conversationId: number,
    userId: number,
) =>
    chatClient.get<ChatMessageEntity[]>({
        url: `/chat/messages/conversation/${conversationId}/${userId}`,
    });

export const getOpenBillingCycle = async (ownerId: number) => {
    return chatClient.get<BillingCycleEntity>({
        url: `/billing/cycle/${ownerId}`,
    });
};

export const getMessages = (userId: number) =>
    chatClient.get<ChatMessageEntity[]>({
        url: `/chat/messages/last/${userId}/0`,
    });
