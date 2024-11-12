import { Server } from 'socket.io';

export default function handler(req, res) {
  // Check if the request method is POST
  if (req.method === 'POST') {
    // Initialize WebSocket server only once
    if (!res.socket.server.io) {
      const io = new Server(res.socket.server);
      res.socket.server.io = io;

      // Handle client connections
      io.on('connection', (socket) => {
        console.log('A user connected');

        // Send a message to the client on connection
        socket.emit('status-update', { message: 'Waiting for updates...' });

        // Handle client disconnection
        socket.on('disconnect', () => {
          console.log('User disconnected');
        });
      });
    }

    // Extract the message from the request body
    const { message } = req.body;

    // If the message is "UnloadingDone", broadcast a WebSocket message to all clients
    if (message === 'UnloadingDone') {
      res.socket.server.io.emit('status-update', { message: 'Delivery done' });
      console.log('WebSocket message emitted: Unloading Done');
    }

    // Respond to the client with a success message
    return res.status(200).json({ message: 'Request processed successfully' });
  }

  // Respond with 405 if the request method is not POST
  res.status(405).end();
}
