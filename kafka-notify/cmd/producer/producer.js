const kafka = require('../../pkg/config/kafkaConfig');
const { User, Notification } = require('../../pkg/models/models');

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

const sendNotification = async (fromID, toID, message, type) => {
    const fromUser = findUserById(fromID);
    const toUser = findUserById(toID);

    if (!fromUser || !toUser) {
        throw new Error('User not found');
    }

    const notification = new Notification(fromUser, toUser, message, type);
    const notificationJSON = JSON.stringify(notification);

    await producer.send({
        topic: type, // Send to the notification type topic
        messages: [
            { key: String(toUser.id), value: notificationJSON },
        ],
    });
};

const run = async () => {
    await producer.connect();
};

run().catch(console.error);

module.exports = { sendNotification };
