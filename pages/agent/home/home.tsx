import {useCallback, useEffect, useRef, useState} from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/agent/clean';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/agent/conversation';

import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';

import {Conversation, Message} from '@/types/agent/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import { Chat } from '@/components/agent/Chat/Chat';
import { Chatbar } from '@/components/agent/Chatbar/Chatbar';
import { Navbar } from '@/components/agent/Mobile/Navbar';
import Promptbar from '@/components/agent/Promptbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import { UserCard } from "@/components/agent/UserCard";
import {BillingCycleEntity, ChatMessageEntity, convertChatMessagesToMessages, formatCurrency, formatDate, PortalUser} from "@/types/agent/models";

import { v4 as uuidv4 } from 'uuid';
import {useSession, getSession} from "next-auth/react";
import {AxiosResponse} from "axios";
import {getConversations, getMessagesByConversationId, markAllMessagesAsRead, upsertConversation} from "@/components/agent/api";
import toast from "react-hot-toast";

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const { data: session } = useSession();
  const portalUser: PortalUser = session?.user as PortalUser;

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data });
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({ field: 'modelError', value: getModelsError(error) });
  }, [dispatch, error, getModelsError]);

  // CONVERSATIONS  ----------------------------------------------

  const fetchConversations = async (userId: number) => {
    return await getConversations(userId);
  }

  const fetchConversationMessages = async (conversationId: number, userId: number)  => {
    return getMessagesByConversationId(conversationId, userId)
  }

  const readAllMessages = async (userId: number, conversationId: number)  => {
    return markAllMessagesAsRead(userId, conversationId)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({ field: 'loading', value: true });

    fetchConversationMessages(conversation.id!!, portalUser.id!!).then(r => {
      const response = r as AxiosResponse<ChatMessageEntity[]>;
      const chatMessages = response.data;

      // Check if there are any unread messages
      const hasUnreadMessages = chatMessages.some(msg => msg.userUnread === true);

      // If there are unread messages, mark them as read
      if (hasUnreadMessages) {
        readAllMessages(portalUser.id!!, conversation.id!!).catch(error => {
          toast.error(t('Error marking messages as read: ' + (error.response?.data?.errorMessage || error.message)));
        });
      }

      conversation.messages = convertChatMessagesToMessages(response.data);

      dispatch({
        field: 'selectedConversation',
        value: conversation,
      });

      saveConversation(conversation);
    }).catch((error) => {
      toast.error(t('Not possible to fetch conversation messages: ' + error.response.data.errorMessage));
    }).finally(() => {
      dispatch({ field: 'loading', value: false });
    });
  };

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: 'conversations', value: updatedConversations });
    //saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    dispatch({ field: 'loading', value: true });

    let newConversation: Conversation = {
      name: t('New Conversation'),
      messages: [],
      //model: OpenAIModels[OpenAIModelID.GPT_3_5],
      //prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
      // user: {
      //   id: portalUser.id,
      // }
    };

    upsertConversation(newConversation)
        .then((r) => {
          let response = r as AxiosResponse;
          if (response.status == 200) {
            const updatedConversations = [...conversations, newConversation];

            dispatch({ field: 'selectedConversation', value: newConversation });
            dispatch({ field: 'conversations', value: updatedConversations });

            //saveConversation(newConversation);
            //saveConversations(updatedConversations);
          }
        })
        .catch((error) => {
          console.log('error:', error);
          toast.error(error.response.data.errorMessage)
        })
        .finally(() => {
          dispatch({ field: 'loading', value: false });
        });

    // const lastConversation = conversations[conversations.length - 1];
    //
    // const newConversation: Conversation = {
    //   id: uuidv4(),
    //   name: t('New Conversation'),
    //   messages: [],
    //   model: lastConversation?.model || {
    //     id: OpenAIModels[defaultModelId].id,
    //     name: OpenAIModels[defaultModelId].name,
    //     maxLength: OpenAIModels[defaultModelId].maxLength,
    //     tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
    //   },
    //   prompt: DEFAULT_SYSTEM_PROMPT,
    //   temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
    //   folderId: null,
    // };



    dispatch({ field: 'loading', value: false });
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  useEffect(() => {
    if (portalUser) {
      fetchConversations(portalUser.id!!).then(r => {
        const response = r as AxiosResponse
        const conversations = response.data as Conversation[];
        conversations.map(conversation => {
          // If messages is undefined, assign an empty array
          if (conversation.messages === undefined) {
            return {...conversation, messages: []};
          }
        });
        dispatch({ field: 'conversations', value: conversations });
      });
    }
  }, [portalUser?.id]);  // Dependency on portalUser's id


  const onSend = useCallback(
      async (message: ChatMessageEntity) => {

      },
      [],
  );

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) });
    }

    // const conversationHistory = localStorage.getItem('conversationHistory');
    // if (conversationHistory) {
    //   const parsedConversationHistory: Conversation[] =
    //     JSON.parse(conversationHistory);
    //   const cleanedConversationHistory = cleanConversationHistory(
    //     parsedConversationHistory,
    //   );
    //
    //   dispatch({ field: 'conversations', value: cleanedConversationHistory });
    // }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      dispatch({
        field: 'selectedConversation',
        value: {
          // id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          // model: OpenAIModels[defaultModelId],
          // prompt: DEFAULT_SYSTEM_PROMPT,
          // temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>Agent</title>
        <meta name="description" content="Agent Butley" />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
          <main className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}>

            {/* Top fixed bar */}
            <div className="fixed bg-[#202123] top-0 left-0 w-full h-12 z-10">
              <div className="container flex justify-between items-center">
                <div className="flex space-x-0">
                  {/*<a href="#" className="text-gray-600 hover:text-gray-100">Services</a>
                            <a href="#" className="text-gray-600 hover:text-gray-100">Industries</a>*/}
                </div>
                <div className="flex space-x-4">
                  {/*<button className="bg-secondary dark:bg-secondary hover:dark:bg-blue-100 shadow-md text-white px-4 py-2 rounded" onClick={() => signOut()}>Logout</button>*/}
                  <UserCard user={portalUser}/>
                </div>
              </div>
            </div>

            <div className="flex h-full w-full pt-[60px] sm:pt-12">
              <Chatbar />
              <div className="flex flex-1">
                <Chat
                    stopConversationRef={stopConversationRef}
                    onSend={onSend}
                />
              </div>
            </div>
          </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  // Check for authentication
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/agent/login',
        permanent: false,
      },
    };
  }

  const defaultModelId =
      (process.env.DEFAULT_MODEL &&
          Object.values(OpenAIModelID).includes(
              process.env.DEFAULT_MODEL as OpenAIModelID,
          ) &&
          process.env.DEFAULT_MODEL) ||
      fallbackModelID;

  let serverSidePluginKeysSet = false;
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
