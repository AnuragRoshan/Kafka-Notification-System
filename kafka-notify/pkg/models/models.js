class User {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Notification {
    constructor(from, to, message) {
        this.from = from;
        this.to = to;
        this.message = message;
    }
}

module.exports = { User, Notification };
