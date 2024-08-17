const kafka = require('../../pkg/config/kafkaConfig');

const consumer = kafka.consumer({ groupId: 'notifications-group' });
const notificationsStore = {
    transactional: {},
    promotional: {},
    useractivities: {}
};

const processNotification = async ({ topic, partition, message }) => {
    const userID = message.key.toString();
    const notification = JSON.parse(message.value.toString());

    if (!notificationsStore[topic][userID]) {
        notificationsStore[topic][userID] = [];
    }
    notificationsStore[topic][userID].push(notification);

    // Example logic to send notifications based on user preferences
    sendToPreferredChannels(notification);

    console.log(`Received ${topic} notification for user ${userID}:`, notification);
};

const sendToPreferredChannels = (notification) => {
    const { to, message, type } = notification;
    // Here you would integrate with WhatsApp, Email, etc.
    if (to.preferences.includes('whatsapp')) {
        sendWhatsAppNotification(to, message);
    }
    if (to.preferences.includes('email')) {
        sendEmailNotification(to, message);
    }
    // Add more channels as needed
};

const run = async () => {
    await consumer.connect();

    const topics = ['transactional', 'promotional', 'useractivities'];
    for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: true });
    }

    await consumer.run({
        eachMessage: processNotification,
    });
};

run().catch(console.error);

module.exports = notificationsStore;
