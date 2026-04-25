import React, { useContext, useState, useRef, useEffect } from 'react';
import { RoomContext } from '../context/RoomContext';
import { storage } from '../services/storage';
import { Send, Smile } from 'lucide-react';
import ReactionsMenu from './ReactionsMenu';
import '../Styles/RoomComponents.css';

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  const handleReactionClick = (emoji) => {
    sendReaction(emoji);
    setIsReactionsOpen(false);
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
          <div className="empty-chat">
            <p>Aun no hay mensajes. ¡Comienza la conversacion!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.userId === userId;
            const isMentor = msg.userRole === 'mentor';
            const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;

            return (
              <div 
                key={msg.id || index} 
                className={`message-wrapper ${isMe ? 'own-message' : 'other-message'} ${isMentor ? 'mentor-msg-wrapper' : ''}`}
              >
                {!isMe && showAvatar && (
                  <div className={`message-avatar ${isMentor ? 'mentor-aura-avatar' : ''}`}>
                    {msg.userAvatar && msg.userAvatar.startsWith('http') ? (
                      <img src={msg.userAvatar} alt={msg.userName} />
                    ) : (
                      <div className="avatar-placeholder">{msg.userName?.charAt(0) || '?'}</div>
                    )}
                    {isMentor && <div className="mentor-badge-chat">M</div>}
                  </div>
                )}
                
                <div className="message-content-group">
                  {showAvatar && !isMe && <span className="message-author">{msg.userName}</span>}
                  <div className={`message-bubble ${isMe ? 'own-bubble' : 'other-bubble'} ${isMentor ? 'mentor-glow-bubble' : ''}`}>
                    <p className="message-text">{msg.texto}</p>
                    <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <div className="reaction-trigger-container">
            <button
              type="button"
              className="btn-icon reaction-btn"
              onClick={() => setIsReactionsOpen(!isReactionsOpen)}
            >
              <Smile size={20} />
            </button>
            
            {isReactionsOpen && (
              <ReactionsMenu onSelect={handleReactionClick} />
            )}
          </div>

          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="message-input"
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn-icon send-btn"
            disabled={!messageText.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
