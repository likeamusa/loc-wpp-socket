import express from 'express';
import http from 'http';
import { DisconnectReason, Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Start the server
io.on('connection', (socket) => {

    const userId = socket.id;
    let locations = [] as any;

    console.log(`User connected: ${userId}`);

    addLocation({ userId, latitude: 0, longitude: 0 });

    // add location
    function addLocation(location: any) {
        locations.push(location);
    }

    // remove location
    function removeLocation(location: any) {
        locations = locations.filter((loc: any) => loc.userId !== location.userId);
    }

    // update location
    function updateLocation(location: any) {
        // update by userId        
        locations = locations.map((loc: any) => {
            if (loc.userId === location.userId) {
                loc.latitude = location.latitude;
                loc.longitude = location.longitude;
            }
            return loc;
        });
    }
    
    socket.on('sendLocation', (location) => {
        updateLocation(location);
        console.log(locations)
        io.emit('locations', locations);
    })
    
    socket.on('disconnect', () => {
        removeLocation({ userId });
        console.log(`User disconnected: ${userId}`);
    });

    io.emit('locations', locations);
});

server.listen(port, () => {
    console.log(`Server is running on ${process.env.NODE_ENV !== 'production' ? 'http://localhost:' : ''}${port}`);
});