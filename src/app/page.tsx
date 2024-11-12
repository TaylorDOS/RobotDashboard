"use client"
import { useEffect, useState } from 'react';

const Home: React.FC = () => {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch('/api/status'); // Replace with your actual API endpoint if different
        if (res.ok) {
          const data = await res.json();
          setMessage(data.message);
        } else {
          console.error('Failed to fetch message:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    // Poll every 1 second
    const intervalId = setInterval(fetchMessage, 3000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Latest Message</h1>
      <p className="text-lg mt-2">{message}</p>
    </div>
  );
};

export default Home;
