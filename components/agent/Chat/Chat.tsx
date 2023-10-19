import { IconClearAll, IconSettings } from '@tabler/icons-react';
import React, {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/agent/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/agent/chat';
import { Plugin } from '@/types/plugin';

import HomeContext from '@/pages/agent/home/home.context';

import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ChatMessageEntity, PortalUser } from "@/types/agent/models";
import { useSession } from "next-auth/react";
import { createMessage, fetchUnreadMessages, getAgentHostUrl, postAgentMessage } from "@/components/agent/api";
import GlobalContext, { useGlobalContext } from "@/contexts/GlobalContext";
import { handleError } from "@/services/apiErrorHandling";
import { sleep } from "@/utils/agent/util";

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
  onSend: (message: ChatMessageEntity) => void;
}

export const Chat = memo(({ stopConversationRef, onSend }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
      agentHostUrl
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const { data: session } = useSession();
  const portalUser: PortalUser = session?.user as PortalUser;
  const { hostURL } = useGlobalContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [streamm, setStreammn] = useState(false);

  const handleStreamm = async () => {
    setStreammn(prev => !prev);
    console.log('streamm', streamm);
    homeDispatch({ field: 'loading', value: streamm });
    homeDispatch({ field: 'messageIsStreaming', value: streamm });
  }

  if (selectedConversation && !selectedConversation.messages) {
    selectedConversation.messages = [];
  }

  const fetchAgentHostUrl = async (userId: number, agentId: number) => {
    return getAgentHostUrl(userId, agentId);
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     console.log(portalUser)
  //     const hostUrlResponse = await fetchAgentHostUrl(portalUser.id!!, 0);
  //     setHostURL(hostUrlResponse.data);
  //
  //     toast.success('Host: ' + hostUrlResponse.data);
  //   };
  //
  //   // Call the async function
  //   fetchData();
  // }, [portalUser]);  // Dependency on portalUser's id

  const persistMessage = async (messageEntity: ChatMessageEntity) => {
    return await createMessage(messageEntity)
  }

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        message.timestamp = new Date().toISOString();
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }

        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        let messageEntity : ChatMessageEntity = {
          userContent: message.content,
          conversation: selectedConversation,
          user: {
            id: portalUser.id
          }
        };

        let createdMessage: ChatMessageEntity;
        const agentToken = '123';
        try {
          const sendMessageResponse = await persistMessage(messageEntity);
          createdMessage = sendMessageResponse.data;
          onSend(createdMessage);

          homeDispatch({
            field: 'selectedConversation',
            value: updatedConversation,
          });

          let agentMessage = {
            chat_message_id: createdMessage.id,
            conversation_id: updatedConversation.id,
          }

          let body = JSON.stringify(agentMessage);
          const response = await postAgentMessage(agentHostUrl!!, body, agentToken)
          if (!response.ok) {
            toast.error(response.statusText);
            return;
          }
          saveConversation(updatedConversation);
        } catch (error) {
          handleError(error, t('Not possible to send message'));
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }

        await sleep(1000);
        const controller = new AbortController();
        try {
          const response = await fetch(`${agentHostUrl!!}/stream/${updatedConversation.id!!}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${agentToken}`
            },
            signal: controller.signal,
          });

          if (!response.ok) {
            homeDispatch({ field: 'loading', value: false });
            homeDispatch({ field: 'messageIsStreaming', value: false });
            toast.error('Failed to get the response streaming');
            return;
          }
          //console.log('Pre-streaming');
          const data = response.body;
          if (!data) {
            homeDispatch({ field: 'loading', value: false });
            homeDispatch({ field: 'messageIsStreaming', value: false });
            return;
          }
          if (updatedConversation.messages.length === 1) {
            const { content } = message;
            const customName =
                content.length > 30 ? content.substring(0, 30) + '...' : content;
            updatedConversation = {
              ...updatedConversation,
              name: customName,
            };
          }
          //homeDispatch({ field: 'loading', value: false });
          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let text = '';
          let isFirst = true;
          while (!done) {
            if (stopConversationRef.current) {
              controller.abort();
              done = true;
              break;
            }
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            text += chunkValue;
            homeDispatch({ field: 'loading', value: false });
            if (isFirst) {
              isFirst = false;
              const updatedMessages: Message[] = [
                ...updatedConversation.messages,
                { role: 'assistant', content: chunkValue },
              ];
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            } else {
              homeDispatch({ field: 'loading', value: false });
              const updatedMessages: Message[] =
                  updatedConversation.messages.map((message, index) => {
                    if (index === updatedConversation.messages.length - 1) {
                      return {
                        ...message,
                        content: text,
                      };
                    }
                    return message;
                  });
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            }
          }
          updatedConversation.messages.pop();

          await sleep(1000);
          const newMessagesCount = await fetchUnreadMessages(portalUser?.id!!, updatedConversation);

          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
              (conversation) => {
                if (conversation.id === selectedConversation.id) {
                  return updatedConversation;
                }
                return conversation;
              },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'messageIsStreaming', value: false });
        } catch (error) {
          console.error('Error:', error);
          handleError(error, t('Not possible to receive the message'));
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
        setCurrentMessage(message);
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
    ],
  );

  const isValidDate = (date) => !isNaN(date);

  const groupByDate = (messages: Message[]) => {
    return messages.reduce((acc, message) => {
      //console.log('message.timestamp', message.timestamp);
      let dateObj;  // Declare dateObj variable
      if (message.timestamp === undefined) {
        message.timestamp = new Date().toISOString();
      }
      dateObj = new Date(message.timestamp);  // Initialize dateObj if timestamp is defined
      const date = dateObj.toLocaleDateString();  // Use dateObj to get the date string
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };


  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   console.log('currentMessage', currentMessage);
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  const groupedMessages = groupByDate(selectedConversation?.messages!!);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {!(apiKey || serverSideApiKeyIsSet) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
            Welcome to Chatbot UI
          </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">{`Chatbot UI is an open source clone of OpenAI's ChatGPT UI.`}</div>
            <div className="mb-2 font-bold">
              Important: Chatbot UI is 100% unaffiliated with OpenAI.
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              Chatbot UI allows you to plug in your API key to use this UI with
              their API.
            </div>
            <div className="mb-2">
              It is <span className="italic">only</span> used to communicate
              with their API.
            </div>
            <div className="mb-2">
              {t(
                'Please set your OpenAI API key in the bottom left of the sidebar.',
              )}
            </div>
            <div>
              {t("If you don't have an OpenAI API key, you can get one here: ")}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div>
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {t('No messages yet.')}
                  </div>
                </div>
              </>
            ) : (
              <>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

                {/*<button
                    className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
                    onClick={handleStreamm}
                >
                  Streamm
                </button>*/}

                {Object.keys(groupedMessages).map(date => (
                    <div key={date}>
                      <div className="text-center font-bold my-1">
                       {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                      </div>
                      {groupedMessages[date].map((message, index) => (
                          <MemoizedChatMessage
                              key={index}
                              message={message}
                              messageIndex={index}
                              onEdit={(editedMessage) => {
                                setCurrentMessage(editedMessage);
                                handleSend(
                                    editedMessage,
                                    selectedConversation?.messages.length - index,
                                );
                              }}
                          />
                      ))}
                    </div>
                ))}

                {loading && <ChatLoader />}

                <div
                  className="h-[162px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
              stopConversationRef={stopConversationRef}
              textareaRef={textareaRef}
              onSend={(message, plugin) => {
                handleSend(message, 0, plugin);
              }}
              onScrollDownClick={handleScrollDown}
              showScrollDownButton={showScrollDownButton}
          />


        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
