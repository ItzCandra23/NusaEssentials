import { system } from "@minecraft/server";
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        system.run(() => this.events[eventName].push(listener));
    }
    async emit(eventName, ...args) {
        if (this.events[eventName]) {
            await new Promise((resolve) => {
                system.run(async () => {
                    for (let listener of this.events[eventName])
                        try {
                            await listener(...args);
                        }
                        catch (err) { }
                    resolve(true);
                });
            });
        }
    }
    off(eventName, listener) {
        if (this.events[eventName]) {
            system.run(() => this.events[eventName] = this.events[eventName].filter(l => l !== listener));
        }
    }
}
export default EventEmitter;
