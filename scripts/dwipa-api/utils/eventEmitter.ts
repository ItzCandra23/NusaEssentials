import { system } from "@minecraft/server";

class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(eventName: string, listener: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        system.run(() => this.events[eventName].push(listener));
    }

    async emit<T = any>(eventName: string, ...args: T[]) {
        if (this.events[eventName]) {
            await new Promise((resolve) => {
                system.run(async () => {
                    for (let listener of this.events[eventName]) try {
                        await listener(...args);
                    } catch(err) {}

                    resolve(true);
                });
            });
        }
    }

    off(eventName: string, listener: Function) {
        if (this.events[eventName]) {
            system.run(() => this.events[eventName] = this.events[eventName].filter(l => l !== listener));
        }
    }
}

export default EventEmitter;