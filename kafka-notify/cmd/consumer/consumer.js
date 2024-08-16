const { Kafka } = require('kafkajs');
const express = require('express');
const bodyParser = require('body-parser');

const kafka = new Kafka({
    clientId: 'notification-consumer',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'notifications-group' });
const notificationsStore = {};

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'notifications', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const userID = message.key.toString();
            const notification = JSON.parse(message.value.toString());

            if (!notificationsStore[userID]) {
                notificationsStore[userID] = [];
            }
            notificationsStore[userID].push(notification);

            console.log(`Received notification for user ${userID}:`, notification);
        }
    });
}

run().catch(console.error);

// Set up Express app
const app = express();
app.use(bodyParser.json());

app.get('/notifications/:userID', (req, res) => {
    const userID = req.params.userID;
    const notifications = notificationsStore[userID] || [];

    if (notifications.length === 0) {
        return res.status(200).json({
            message: 'No notifications found for user',
            notifications: []
        });
    }

    return res.status(200).json({ notifications });
});

app.listen(8081, () => {
    console.log('Kafka CONSUMER (Group: notifications-group) 👥📥 started at http://localhost:8081');
});
