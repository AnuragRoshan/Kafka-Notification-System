const express = require('express');
const bodyParser = require('body-parser');
const { sendNotification } = require('./cmd/producer/producer');
const notificationsStore = require('./cmd/consumer/consumer');

const app = express();
app.use(bodyParser.json());

// Endpoint to send a notification
app.post('/send', async (req, res) => {
    try {
        const { fromID, toID, message } = req.body;
        const type = req.body.topic;
        // Ensure the notification type is valid
        if (!['transactional', 'promotional', 'useractivities'].includes(type)) {
            return res.status(400).json({ message: 'Invalid notification type' });
        }

        await sendNotification(fromID, toID, message, type);
        res.status(200).json({ message: 'Notification sent successfully!' });
    } catch (err) {
        console.error('Failed to send notification:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to get notifications for a specific user and topic
app.get('/notifications/:userID/:topic', (req, res) => {
    const { userID, topic } = req.params;

    // Ensure the topic is valid
    if (!['transactional', 'promotional', 'useractivities'].includes(topic)) {
        return res.status(400).json({ message: 'Invalid topic' });
    }

    const notifications = notificationsStore[topic][userID] || [];
    res.status(200).json({ notifications });
});

// Start the server
app.listen(8080, () => {
    console.log('Express server started at http://localhost:8080');
});
