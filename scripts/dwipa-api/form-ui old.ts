import { Player, RawMessage, system, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, FormCancelationReason, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import Translate from "./translate";
import { CommandPermissionLevel } from "./command";
import { ChestFormData } from "./utils/chestgui";
import PlayerRank from "./playerrank";

export interface FormItemButton {
    text: string|RawMessage;
    image?: string;
}

export interface FormItemLabel {
    type: "label";
    text: string|RawMessage;
    image?: string;
}

export interface FormItemToggle {
    type: "toggle";
    text: string|RawMessage;
    default?: boolean;
}

export interface FormItemSlider {
    type: "slider";
    text: string|RawMessage;
    min: number;
    max: number;
    step: number;
    default?: number;
}

export interface FormItemStepSlider {
    type: "step_slider";
    text: string|RawMessage;
    steps: (string|RawMessage)[];
    default?: number;
}

export interface FormItemDropdown {
    type: "dropdown";
    text: string|RawMessage;
    options: (string|RawMessage)[];
    default?: number;
}

export interface FormItemInput {
    type: "input";
    text: string|RawMessage;
    placeholder: string|RawMessage;
    default?: string;
}

export type FormItem = FormItemLabel | FormItemToggle | FormItemSlider | FormItemStepSlider | FormItemDropdown | FormItemInput;

export class FormButton {
    text: string|RawMessage;
    constructor(text: string|RawMessage, public imagePath: string = "") {
        if (typeof text === "string") text=Translate.translate(text);

        this.text=text;
    }

    destruct() {
        (this as any).text = null;
        (this as any).imagePath = null;
    }
}

class FormComponent {
    constructor(public readonly type: string, public text: string|RawMessage) {}

    destruct() {
        (this as any).text = null;
        (this as any).type = null;
    }
}

/**
 * @deprecated
 */
export class FormLabel extends FormComponent implements FormItemLabel {
    readonly type = "label";
    constructor(text: string|RawMessage) {
        if (typeof text === "string") text=Translate.translate(text);

        super("label", text);
    }

    destruct() {
        (this as any).text = null;
        (this as any).type = null;
    }
}

export class FormToggle extends FormComponent implements FormItemToggle {
    readonly type = "toggle";
    default: boolean;
    constructor(text: string|RawMessage, defaultValue?: boolean) {
        if (typeof text === "string") text=Translate.translate(text);

        super("toggle", text);
        if (defaultValue) this.default = defaultValue;
        else this.default=false;
    }

    destruct() {
        (this as any).text = null;
        (this as any).default = null;
        (this as any).type = null;
    }
}

export class FormSlider extends FormComponent implements FormItemSlider {
    readonly type = "slider";
    min: number;
    max: number;
    step: number;
    default: number;
    constructor(text: string|RawMessage, min: number, max: number, step: number, defaultValue?: number) {
        if (typeof text === "string") text=Translate.translate(text);

        super("slider", text);
        this.min = min;
        this.max = max;
        this.step = step;
        if (defaultValue) this.default = defaultValue;
        else this.default=min;
    }

    destruct() {
        (this as any).text = null;
        (this as any).min = null;
        (this as any).max = null;
        (this as any).default = null;
        (this as any).type = null;
    }
}

/**
 * @deprecated
 */
export class FormStepSlider extends FormComponent implements FormItemStepSlider {
    readonly type = "step_slider";
    steps: (string|RawMessage)[];
    default: number;
    constructor(text: string|RawMessage, steps: (string|RawMessage)[], defaultIndex?: number) {
        if (typeof text === "string") text=Translate.translate(text);
        if (steps.find((v) => typeof v === "string")) steps=steps.map((v) => {
            if (typeof v === "string") return Translate.translate(v);
            return v;
        });
        
        super("step_slider", text);
        this.steps = steps;
        if (defaultIndex) this.default = defaultIndex;
        else this.default=0;
    }

    destruct() {
        (this as any).text = null;
        (this as any).steps = null;
        (this as any).default = null;
        (this as any).type = null;
    }
}

export class FormDropdown extends FormComponent implements FormItemDropdown {
    readonly type = "dropdown";
    options: (string|RawMessage)[];
    default: number;
    constructor(text: string|RawMessage, options: (string|RawMessage)[], defaultIndex?: number) {
        if (typeof text === "string") text=Translate.translate(text);
        if (options.find((v) => typeof v === "string")) options=options.map((v) => {
            if (typeof v === "string") return Translate.translate(v);
            return v;
        });

        super("dropdown", text);
        this.options = options;
        if (defaultIndex) this.default = defaultIndex;
        else this.default=0;
    }

    destruct() {
        (this as any).text = null;
        (this as any).options = null;
        (this as any).default = null;
        (this as any).type = null;
    }
}

export class FormInput extends FormComponent implements FormItemInput {
    readonly type = "input";
    placeholder: string|RawMessage;
    default?: string;
    constructor(text: string|RawMessage, placeholder: string|RawMessage, defaultValue?: string) {
        if (typeof text === "string") text=Translate.translate(text);
        if (typeof placeholder === "string") placeholder=Translate.translate(placeholder);
        if (typeof defaultValue === "string") defaultValue=Translate.translate(defaultValue);

        super("input", text);
        this.placeholder = placeholder;
        this.default = defaultValue;
    }

    destruct() {
        (this as any).text = null;
        (this as any).placeholder = null;
        (this as any).default = null;
        (this as any).type = null;
    }
}

const PlayerBusyList = new Map<string, number>();
const TextureItems = new Map<string, [string, boolean]>();

export class ChestForm {

    static setItemTexture(itemId: string, texture: string, enchanted: boolean = false) {
        TextureItems.set(itemId, [texture, enchanted]);
    }

    private form;

    constructor(title: string = "", size: "small" | "single" | "large" | "double" | "5" | "9" | "18" | "27" | "36" | "45" | "54" = "single") {
        const form = new ChestFormData(size);
        form.title(title);

        this.form = form;
    }

    setTitle(title: string) {
        this.form.title(title);
    }

    setButton(slot: number, itemName?: string | undefined, itemDesc?: string[] | undefined, texture?: string | undefined, stackAmount?: number | undefined, enchanted?: boolean | undefined) {
        if (texture) {
            const _texture = TextureItems.get(texture);

            if (_texture) {
                texture=_texture[0];

                if (!enchanted && _texture[1]) enchanted=true;
            }
        }

        this.form.button(slot, itemName, itemDesc, texture, stackAmount, enchanted);
    }

    setPattern(pattern: string[], key: {
        [key: string]: {
            itemName?: string | undefined;
            itemDesc?: string[] | undefined;
            stackSize?: number | undefined;
            enchanted?: boolean | undefined;
            texture: string;
        };
    }) {
        this.form.pattern(pattern, key);
    }

    sendTo(player: Player, permission?: string|CommandPermissionLevel, busy: boolean = true): Promise<ActionFormResponse> {
        const form = this.form;
        return new Promise((resolve, reject) => {
            system.run(async () => {
                try {
                    if (permission === CommandPermissionLevel.ADMIN) permission="admin";
                    if (permission === CommandPermissionLevel.NORMAL) permission=undefined;
                    if (permission && !PlayerRank.hasPermission(player.id, permission)) {
                        resolve({
                            canceled: true,
                            cancelationReason: FormCancelationReason.UserClosed,
                        });
                        return;
                    }

                    const res = await form.show(player);

                    if (res.cancelationReason === FormCancelationReason.UserBusy && busy) {
                        let setted = false;
                        let timeout = 0;

                        player.sendMessage(Translate.translate("form-ui.message.busy"));
                        const interval = system.runInterval(() => {
                            if (setted === false) {
                                PlayerBusyList.set(player.id, interval);
                                setted=true;
                            }

                            if (timeout >= 600 || PlayerBusyList.get(player.id) !== interval) {
                                system.clearRun(interval);
                                resolve(res);
                            }

                            if (player.isJumping) {
                                system.clearRun(interval);
                                resolve(this.sendTo(player, permission, busy));
                            }

                            timeout++;
                        }, 2);
                        
                        world.beforeEvents.playerLeave.subscribe((ev) => {
                            if (ev.player.id === player.id) {
                                system.clearRun(interval);
                                reject(`FormUI: ${player.name} left`);
                            }
                        });
                        return;
                    }

                    resolve(res);
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
}

export class SimpleForm {
    private data;
    private labels = new Map<number, string>();

    constructor(title: string|RawMessage = "", content: string|RawMessage = "", buttons: FormButton[] = []) {
        this.data={
            title,
            content,
            buttons,
        };
    }

    getTitle(): string|RawMessage {
        return this.data.title;
    }

    setTitle(title: string|RawMessage): void {
        this.data.title = title;
    }

    getContent(): string|RawMessage {
        return this.data.content;
    }

    setContent(content: string|RawMessage): void {
        this.data.content = content;
    }

    addButton(button: FormButton, label?: string): void {
        this.data.buttons!.push(button);
        if (label) this.labels.set(this.data.buttons!.length - 1, label);
    }

    getButton(indexOrLabel: string | number): FormButton | null {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel) return this.data.buttons![index] as FormButton;
            }
        } else {
            return this.data.buttons![indexOrLabel] as FormButton;
        }
        return null;
    }

    sendTo(player: Player, permission?: string|CommandPermissionLevel, force: boolean = true): Promise<ActionFormResponse> {
        const form = new ActionFormData();

        if (typeof this.data.title === "string") this.data.title=Translate.translate(this.data.title);
        if (typeof this.data.content === "string") this.data.content=Translate.translate(this.data.content);

        form.title(this.data.title);
        form.body(this.data.content);

        this.data.buttons.forEach((button) => form.button(button.text, button.imagePath));

        return new Promise((resolve, reject) => {
            system.run(async () => {
                try {
                    if (permission === CommandPermissionLevel.ADMIN) permission="admin";
                    if (permission === CommandPermissionLevel.NORMAL) permission=undefined;
                    if (permission && !PlayerRank.hasPermission(player.id, permission)) {
                        resolve({
                            canceled: true,
                            cancelationReason: FormCancelationReason.UserClosed,
                        });
                        return;
                    }

                    const res = await form.show(player as any);

                    if (res.cancelationReason === FormCancelationReason.UserBusy && force) {
                        let setted = false;
                        let timeout = 0;

                        player.sendMessage(Translate.translate("form-ui.message.busy"));
                        const interval = system.runInterval(() => {
                            if (setted === false) {
                                PlayerBusyList.set(player.id, interval);
                                setted=true;
                            }

                            if (timeout >= 600 || PlayerBusyList.get(player.id) !== interval) {
                                system.clearRun(interval);
                                resolve(res);
                            }

                            if (player.isJumping) {
                                system.clearRun(interval);
                                resolve(this.sendTo(player, permission, force));
                            }

                            timeout++;
                        }, 2);
                        
                        world.beforeEvents.playerLeave.subscribe((ev) => {
                            if (ev.player.id === player.id) {
                                system.clearRun(interval);
                                reject(`FormUI: ${player.name} left`);
                            }
                        });
                        return;
                    }

                    resolve(res);
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
}

export class ModalForm {
    private data: {
        title: string|RawMessage;
        content: string|RawMessage;
        button1: string|RawMessage;
        button2: string|RawMessage;
    };

    constructor(title = "", content = "") {
        this.data={
            title,
            content,
            button1: "",
            button2: "",
        };
    }

    getTitle(): string|RawMessage {
        return this.data.title;
    }

    setTitle(title: string|RawMessage): void {
        this.data.title = title;
    }

    getContent(): string|RawMessage {
        return this.data.content as string|RawMessage;
    }

    setContent(content: string|RawMessage): void {
        this.data.content = content;
    }

    getButtonConfirm(): string|RawMessage {
        return this.data.button1;
    }

    setButtonConfirm(text: string|RawMessage): void {
        if (typeof text === "string") text=Translate.translate(text);
        this.data.button1 = text;
    }

    getButtonCancel(): string|RawMessage {
        return this.data.button2;
    }

    setButtonCancel(text: string|RawMessage): void {
        if (typeof text === "string") text=Translate.translate(text);
        this.data.button2 = text;
    }

    sendTo(player: Player, permission?: string|CommandPermissionLevel, busy: boolean = true): Promise<MessageFormResponse> {
        const form = new MessageFormData();

        if (typeof this.data.title === "string") this.data.title=Translate.translate(this.data.title);
        if (typeof this.data.content === "string") this.data.content=Translate.translate(this.data.content);

        form.title(this.data.title);
        form.body(this.data.content);
        form.button2(this.data.button1);
        form.button1(this.data.button2);

        return new Promise((resolve, reject) => {
            system.run(async () => {
                try {
                    if (permission === CommandPermissionLevel.ADMIN) permission="admin";
                    if (permission === CommandPermissionLevel.NORMAL) permission=undefined;
                    if (permission && !PlayerRank.hasPermission(player.id, permission)) {
                        resolve({
                            canceled: true,
                            cancelationReason: FormCancelationReason.UserClosed,
                        });
                        return;
                    }

                    const res = await form.show(player as any);

                    if (res.cancelationReason === FormCancelationReason.UserBusy && busy) {
                        let setted = false;
                        let timeout = 0;

                        player.sendMessage(Translate.translate("form-ui.message.busy"));
                        const interval = system.runInterval(() => {
                            if (setted === false) {
                                PlayerBusyList.set(player.id, interval);
                                setted=true;
                            }

                            if (timeout >= 600 || PlayerBusyList.get(player.id) !== interval) {
                                system.clearRun(interval);
                                resolve(res);
                            }

                            if (player.isJumping) {
                                system.clearRun(interval);
                                resolve(this.sendTo(player, permission, busy));
                            }

                            timeout++;
                        }, 2);
                        
                        world.beforeEvents.playerLeave.subscribe((ev) => {
                            if (ev.player.id === player.id) {
                                system.clearRun(interval);
                                reject(`FormUI: ${player.name} left`);
                            }
                        });
                        return;
                    }

                    resolve(res);
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
}

export class CustomForm {
    private data;
    private labels = new Map<number, string>();

    constructor(title: string|RawMessage = "", content: FormComponent[] = []) {
        this.data={
            title,
            content: content as FormItem[],
        };
    }

    getTitle(): string|RawMessage {
        return this.data.title;
    }

    setTitle(title: string|RawMessage): void {
        this.data.title = title;
    }

    addComponent(component: FormComponent, label?: string): void {
        (this.data.content as FormComponent[]).push(component);
        if (label) this.labels.set(this.data.content!.length - 1, label);
    }

    getComponent(indexOrLabel: string | number): FormComponent | null {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel) return (this.data.content as FormComponent[])[index];
            }
        } else {
            return (this.data.content as FormComponent[])[indexOrLabel];
        }
        return null;
    }

    sendTo(player: Player, permission?: string|CommandPermissionLevel, busy: boolean = true): Promise<ModalFormResponse> {
        const form = new ModalFormData();

        if (typeof this.data.title === "string") this.data.title=Translate.translate(this.data.title);

        form.title(this.data.title);

        this.data.content.forEach((item) => {
            if (item.type === "input") form.textField(item.text, item.placeholder, item.default);
            if (item.type === "toggle") form.toggle(item.text, item.default);
            if (item.type === "slider") form.slider(item.text, item.min, item.max, item.step, item.default);
            if (item.type === "step_slider") form.dropdown(item.text, item.steps, item.default);
            if (item.type === "dropdown") form.dropdown(item.text, item.options, item.default);
        });

        return new Promise((resolve, reject) => {
            system.run(async () => {
                try {
                    if (permission === CommandPermissionLevel.ADMIN) permission="admin";
                    if (permission === CommandPermissionLevel.NORMAL) permission=undefined;
                    if (permission && !PlayerRank.hasPermission(player.id, permission)) {
                        resolve({
                            canceled: true,
                            cancelationReason: FormCancelationReason.UserClosed,
                        });
                        return;
                    }

                    const res = await form.show(player as any);

                    if (res.cancelationReason === FormCancelationReason.UserBusy && busy) {
                        let setted = false;
                        let timeout = 0;

                        player.sendMessage(Translate.translate("form-ui.message.busy"));
                        const interval = system.runInterval(() => {
                            if (setted === false) {
                                PlayerBusyList.set(player.id, interval);
                                setted=true;
                            }

                            if (timeout >= 600 || PlayerBusyList.get(player.id) !== interval) {
                                system.clearRun(interval);
                                resolve(res);
                            }

                            if (player.isJumping) {
                                system.clearRun(interval);
                                resolve(this.sendTo(player, permission, busy));
                            }

                            timeout++;
                        }, 2);
                        
                        world.beforeEvents.playerLeave.subscribe((ev) => {
                            if (ev.player.id === player.id) {
                                system.clearRun(interval);
                                reject(`FormUI: ${player.name} left`);
                            }
                        });
                        return;
                    }

                    resolve(res);
                } catch(err) {
                    reject(err);
                }
            });
        });
    }
}