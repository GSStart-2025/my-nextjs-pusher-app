"use client"; // Force client-side rendering
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // Initialize Pusher **only on the client**
  useEffect(() => {
    // Check if running in browser (optional but safe)
    if (typeof window !== 'undefined') {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      const channel = pusher.subscribe('chat-channel');
      channel.bind('new-message', (data: { message: string }) => {
        setMessages((prev) => [...prev, data.message]);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe('chat-channel');
      };
    }
  }, []);

  const sendMessage = async () => {
    await fetch('/api/pusher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'chat-channel',
        event: 'new-message',
        message: input,
      }),
    });
    setInput('');
  };

  return (
    <div>
      <h1>Real-Time Chat</h1>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}