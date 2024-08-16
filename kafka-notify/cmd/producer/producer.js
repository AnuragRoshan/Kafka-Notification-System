// src/producer/producer.js

const { Kafka } = require('kafkajs');
const express = require('express');
const bodyParser = require('body-parser');
const { User, Notification } = require('../../pkg/models/models');

const app = express();
app.use(bodyParser.json());

const kafka = new Kafka({
    clientId: 'kafka-notify',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

const users = [
    new User(1, 'Emma'),
    new User(2, 'Bruno'),
    new User(3, 'Rick'),
    new User(4, 'Lena'),
    new User(5, 'Mike'),
    new User(6, 'Sara'),
    new User(7, 'David'),
];

const findUserById = (id) => users.find(user => user.id === id);

app.post('/send', async (req, res) => {
    try {
        const { fromID, toID, message } = req.body;

        const fromUser = findUserById(fromID);
        const toUser = findUserById(toID);

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const notification = new Notification(fromUser, toUser, message);
        const notificationJSON = JSON.stringify(notification);

        await producer.send({
            topic: 'notifications',
            messages: [
                { key: String(toUser.id), value: notificationJSON },
            ],
        });

        res.status(200).json({ message: 'Notification sent successfully!' });
    } catch (err) {
        console.error('Failed to send notification:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.json(users);
});

const run = async () => {
    await producer.connect();
    app.listen(8080, () => {
        console.log('Kafka PRODUCER 📨 started at http://localhost:8080');
    });
};

run().catch(console.error);
