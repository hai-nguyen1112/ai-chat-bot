import React, { useState } from 'react';
import './ChatBotApp.css';

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
      setInputValue('');
    } else {
      setMessages(updatedMessages);
      setInputValue('');

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
      setChats(updatedChats);
    }

    const response = await fetch('http://localhost:3000/api/chat', {
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

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: updatedMessagesWithResponse }
          : chat
      )
    );
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
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      handleSelectChat(newActiveChat);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => {
              onNewChat();
              setMessages([]);
            }}
          ></i>
        </div>
        {chats.map((chat) => {
          return (
            <div
              key={chat.id}
              className={`chat-list-item ${
                chat.id === activeChat ? 'active' : ''
              }`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <h4>{chat.displayId}</h4>
              <i
                className="bx bx-x-circle"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
              ></i>
            </div>
          );
        })}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI</h3>
          <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
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
          <div className="typing">Typing...</div>
        </div>
        <form className="msg-form" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-face-smile emoji"></i>
          <input
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
