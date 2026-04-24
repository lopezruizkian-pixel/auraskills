import React, { useContext, useState, useRef, useEffect } from 'react';
import { RoomContext } from '../context/RoomContext';
import { Send, Smile } from 'lucide-react';
import ReactionsMenu from './ReactionsMenu';
import '../Styles/RoomComponents.css';

const formatMessageTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

function ChatRoom({ sendMessage, sendReaction }) {
  const { messages } = useContext(RoomContext);
  const [messageText, setMessageText] = useState('');
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    sendMessage(messageText);
    setMessageText('');
  };

  const handleReactionClick = (emoji) => {
    sendReaction(emoji);
  };

  const userId = storage.get('userId');

  return (
    <div className="chat-room premium-chat">
      <div className="chat-header">
        <h3>Canal de Sesión</h3>
        <span className="message-count">{messages.length} mensajes</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="aura-portal-mini"></div>
            <p>La conexión está establecida.</p>
            <p className="text-small">Comparte algo para iniciar la conversación.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.userId === userId;
            return (
              <div key={message.id} className={`message-wrapper ${isMe ? 'is-me' : 'is-other'}`}>
                {!isMe && (
                  <div className="message-avatar-container">
                    <div className="msg-avatar">{message.userAvatar}</div>
                  </div>
                )}
                <div className="message-bubble">
                  {!isMe && <span className="message-author">{message.userName}</span>}
                  <p className="message-text">{message.texto}</p>
                  <span className="message-time">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                {isMe && (
                  <div className="message-avatar-container">
                    <div className="msg-avatar me">{message.userAvatar}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="message-input"
            autoComplete="off"
          />
          <button
            type="button"
            className="reactions-btn"
            onClick={() => setIsReactionsOpen(!isReactionsOpen)}
            aria-label="Reacciones"
            title="Agregar reaccion"
          >
            <Smile size={18} />
          </button>
          <button
            type="submit"
            className="send-btn"
            disabled={!messageText.trim()}
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <ReactionsMenu
        onReactionSelect={handleReactionClick}
        isOpen={isReactionsOpen}
        setIsOpen={setIsReactionsOpen}
      />
    </div>
  );
}

export default ChatRoom;
