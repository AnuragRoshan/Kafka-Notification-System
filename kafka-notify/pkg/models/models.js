class User {
    constructor(id, name, preferences = []) {
        this.id = id;
        this.name = name;
        this.preferences = preferences; // e.g., ['whatsapp', 'email']
    }
}

class Notification {
    constructor(from, to, message, type) {
        this.from = from;
        this.to = to;
        this.message = message;
        this.type = type;  // e.g., 'promotional', 'transactional', 'useractivities'
    }
}

module.exports = { User, Notification };
