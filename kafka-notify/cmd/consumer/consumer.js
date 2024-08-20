const kafka = require('../../pkg/config/kafkaConfig');
// const { storeNotification } = require('../../pkg/db/notificationService'); // Import MongoDB storage service
const RateLimiterFlexible = require('rate-limiter-flexible');

const consumer = kafka.consumer({ groupId: 'notifications-group' });

// Create rate limiters for different channels
const emailRateLimiter = new RateLimiterFlexible.RateLimiterMemory({
    points: 10, // Number of notifications allowed per second
    duration: 1, // Duration in seconds
});

const whatsappRateLimiter = new RateLimiterFlexible.RateLimiterMemory({
    points: 25, // Number of notifications allowed per second
    duration: 1, // Duration in seconds
});

// Simulated notification sending functions
const sendWhatsAppNotification = async (to, message) => {
    console.log(`Sending WhatsApp notification to ${to.name}: ${message}`);
};

const sendEmailNotification = async (to, message) => {
    console.log(`Sending Email notification to ${to.name}: ${message}`);
};

const sendToPreferredChannels = async (notification) => {
    const { to, message } = notification;

    if (to.preferences.includes('whatsapp')) {
        try {
            await whatsappRateLimiter.consume(to.id); // Rate limit by user ID
            await sendWhatsAppNotification(to, message);
        } catch (rateLimiterRes) {
            console.log('WhatsApp rate limit exceeded for user', to.id);
        }
    }

    if (to.preferences.includes('email')) {
        try {
            await emailRateLimiter.consume(to.id); // Rate limit by user ID
            await sendEmailNotification(to, message);
        } catch (rateLimiterRes) {
            console.log('Email rate limit exceeded for user', to.id);
        }
    }
};

const processNotification = async ({ topic, partition, message }) => {
    const userID = message.key.toString();
    const notification = JSON.parse(message.value.toString());

    // Store the notification in MongoDB
    // await storeNotification(userID, topic, notification);
    console.log(`Stored ${topic} notification for user ${userID} in MongoDB:`, notification);

    // Send notifications based on user preferences with rate limiting
    await sendToPreferredChannels(notification);
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
