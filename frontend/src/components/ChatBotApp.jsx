import React, { useEffect, useRef, useState } from 'react';
import './ChatBotApp.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const ChatBotApp = ({
  onGoBack,
  chats,
  setChats,
  activeChat,
  setActiveChat,
  onNewChat,
  messages,
  setMessages,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const chatEndRef = useRef(null);
  const chatListRef = useRef(null);

  useEffect(() => {
    if (activeChat) {
      const storedMessages = JSON.parse(localStorage.getItem(activeChat)) || [];
      setMessages(storedMessages);
    }
  }, [activeChat, setMessages]);

  // Close chat list on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatListRef.current && !chatListRef.current.contains(event.target)) {
        setShowChatList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    setInputValue((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;

    const newMessage = {
      type: 'prompt',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, newMessage];

    if (!activeChat) {
      onNewChat(inputValue);
      setMessages(updatedMessages);
      localStorage.setItem(activeChat, JSON.stringify(updatedMessages));
      setInputValue('');
    } else {
      setMessages(updatedMessages);
      localStorage.setItem(activeChat, JSON.stringify(updatedMessages));
      setInputValue('');

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }

    setIsTyping(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputValue }),
    });

    const data = await response.json();
    const chatResponse = data.choices[0].message.content.trim();

    const newResponse = {
      type: 'response',
      text: chatResponse,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessagesWithResponse = [...updatedMessages, newResponse];
    setMessages(updatedMessagesWithResponse);
    localStorage.setItem(
      activeChat,
      JSON.stringify(updatedMessagesWithResponse)
    );

    setChats((prevChats) => {
      let updatedChats = prevChats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: updatedMessagesWithResponse }
          : chat
      );
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      return updatedChats;
    });

    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectChat = (id) => {
    setActiveChat(id);
    const activeChatObj = chats.find((chat) => chat.id === id);
    setMessages(activeChatObj ? activeChatObj.messages : []);
    setShowChatList(false);
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    localStorage.removeItem(id);

    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      handleSelectChat(newActiveChat);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-app">
      <div
        ref={chatListRef}
        className={`chat-list ${showChatList ? 'show' : ''}`}
      >
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className={`bx bx-edit-alt new-chat ${isTyping ? 'disabled' : ''}`}
            onClick={
              isTyping
                ? undefined
                : () => {
                    onNewChat();
                    setMessages([]);
                  }
            }
          ></i>
          <i
            className="bx bx-x-circle close-list"
            onClick={() => setShowChatList(false)}
          ></i>
        </div>
        {chats.map((chat) => {
          return (
            <div
              key={chat.id}
              className={`chat-list-item ${
                chat.id === activeChat ? 'active' : ''
              }`}
              onClick={isTyping ? undefined : () => handleSelectChat(chat.id)}
            >
              <h4>{chat.displayId}</h4>
              <i
                className={`bx bx-x-circle ${isTyping ? 'disabled' : ''}`}
                onClick={
                  isTyping
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }
                }
              ></i>
            </div>
          );
        })}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <i
            className="bx bx-menu chat-menu"
            onClick={() => setShowChatList(true)}
          ></i>
          <i
            className={`bx bx-arrow-back arrow ${isTyping ? 'disabled' : ''}`}
            onClick={isTyping ? undefined : onGoBack}
          ></i>
        </div>
        <div className="chat">
          {messages.map((message, index) => {
            return (
              <div
                key={index}
                className={message.type === 'prompt' ? 'prompt' : 'response'}
              >
                {message.text} <span>{message.timestamp}</span>
              </div>
            );
          })}
          {isTyping && <div className="typing">Typing...</div>}
          <div ref={chatEndRef}></div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i
            className={`fa-solid fa-face-smile emoji ${
              isTyping ? 'disabled' : ''
            }`}
            onClick={
              isTyping ? undefined : () => setShowEmojiPicker((prev) => !prev)
            }
          ></i>
          {showEmojiPicker ? (
            <div className="picker">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          ) : null}
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            onFocus={() => setShowEmojiPicker(false)}
          />
          <i
            className={`fa-solid fa-paper-plane ${isTyping ? 'disabled' : ''}`}
            onClick={isTyping ? undefined : sendMessage}
          ></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
