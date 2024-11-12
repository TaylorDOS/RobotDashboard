import { Server } from 'socket.io';

export default function handler(req, res) {
  // Check for POST request to trigger WebSocket message
  if (req.method === 'POST') {
    // Initialize WebSocket server (only once)
    if (!res.socket.server.io) {
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      // When a client connects, listen for status updates
      io.on('connection', (socket) => {
        console.log('a user connected');

        // Emit a message to the client (just an example on connection)
        socket.emit('status-update', { message: 'Waiting for updates...' });

        // Handle client disconnection
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });
    }

    // Parse the incoming request body
    const { message } = req.body;

    // If the message is "UnloadingDone", emit a WebSocket message to all connected clients
    if (message === 'UnloadingDone') {
      // Send a message to all connected clients
      res.socket.server.io.emit('status-update', { message: 'Delivery done' });

      console.log('WebSocket message emitted: Unloading Done');
    }

    // Respond back with a success status
    return res.status(200).json({ message: 'Request processed successfully' });
  }

  // If method is not POST, return 405 Method Not Allowed
  res.status(405).end();
}
