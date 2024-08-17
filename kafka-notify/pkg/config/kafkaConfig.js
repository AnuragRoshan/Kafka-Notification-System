const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'kafka-notify',
    brokers: ['localhost:9092'],
});

module.exports = kafka;
