import type { ActivityClientProps, CreateActivityProps } from '../index';

import { EventEmitter } from 'events';
import Discord from 'discord.js';

import { MessageComponent, MessageEmbedComponent } from './components';
import Reaction, { ReactionEvent } from './reaction';
import Component from './component';
import Activity from './activity';


export class DiscordActivity extends EventEmitter {
    private channelId: string | null
    private _removeMessage: boolean
    private _removeAllMessage: boolean
    private _isReady: boolean
    private _updatePending: number

    private currentActivity: Activity | null
    private activity: Activity[]

    client: Discord.Client


    constructor(props: ActivityClientProps = {}) {
        super();

        this.channelId = null;
        this._removeMessage = props.autoRemoveMessage !== undefined ? props.autoRemoveMessage : false;
        this._removeAllMessage = props.removeAllMessage !== undefined ? props.removeAllMessage : false;
        this._isReady = false;
        this._updatePending = 0;

        this.currentActivity = null;
        this.activity = [];

        this.client = props.client || new Discord.Client();
        this.client.on('error', (err) => this.emit('error', err));
        this.client.on('ready', () => this.emit('client_ready'));

        this.on('client_ready', () => this.onClientReady());
        this.on('update', () => this.onUpdate());

        this.client.on('messageReactionRemove', (message, user) => this.onMessageReactionRemove(message, user));
        this.client.on('messageReactionAdd', (message, user) => this.onMessageReactionAdd(message, user));
        this.client.on("message", (message) => this.onMessage(message));
    }

    async login(token: string, channelId: string) {
        if (!channelId) throw new Error('You must provide a channelId');
        if (!token) throw new Error('You must provide a token');
        this.channelId = channelId

        return await this.client.login(token);
    }

    getActivity(activityId: string) {
        return this.activity.find((i) => (i.name === activityId || i.id === activityId)) || null;
    }

    createActivity({ isActive, ...props }: {
        isActive?: boolean
        components?: Component[]
        name?: string
    } = {}) {
        if (props && props.name) {
            if (this.getActivity(props.name)) {
                throw new Error('this activity name is already in use');
            }
        }
        var activity = new Activity(props);

        return this.addActivity(activity, isActive);
    }

    addActivity(activity: Activity, isActive?: boolean) {
        this.activity.push(activity);
        activity.on('update', () => this.update());
        activity.on('mounted', ((activity: Activity) => this.emit('mounted', activity)).bind(this, activity));
        activity.on('unmounted', ((activity: Activity) => this.emit('unmounted', activity)).bind(this, activity));

        if (isActive) this.setActive(activity);

        return activity
    }

    setActive(activityId: Activity | string) {
        var activity = this.getActivity(activityId instanceof Activity ? activityId.id : activityId);
        if (!activity) return null

        if (this.currentActivity && this.currentActivity.isMount()) this.currentActivity.unmount();
        this.currentActivity = activity
        if (this._isReady) this.update();

        return activity
    }

    private async getChannel() {
        if (!this._isReady) return null;
        if (!this.channelId) return null;
        var channel: any = await this.client.channels.fetch(this.channelId);
        if (channel.type !== 'text' && !(channel instanceof Discord.TextChannel)) return null

        return channel as Discord.TextChannel
    }

    private async getUser() {
        return this.client.user
    }

    private async render() {
        if (!this._isReady) return false

        var currentActivity = this.currentActivity
        var channel = await this.getChannel();
        if (!channel) throw new Error('Fail to fetch channel or invalid channel type');
        if (channel.deleted) throw new Error('Channel has been deleted');

        if (currentActivity) {
            await currentActivity.mount(channel);

            return true
        } else {
            return false
        }
    }

    private async _clear() {
        if (!this._removeAllMessage) return false
        var channel = await this.getChannel();
        if (!channel || channel.deleted) return false;

        var messages = await channel.messages.fetch();

        for (var message of messages.array()) {
            await message.delete();
        }

        if (this.currentActivity && this.currentActivity.isMount()) {
            await this.currentActivity.unmount();
        }

        return true
    }

    private async update() {
        if (this._updatePending) return
        this._updatePending++

        setTimeout(() => {
            this.emit('update');
        }, 1000);
    }


    // Events
    private async onClientReady() {
        this._isReady = true

        if (this._removeAllMessage) {
            //  Cleanup all messages
            await this._clear();
        }
        this.update();

        this.emit('ready');
    }

    private async onMessageReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        const currentActivity = this.currentActivity
        if (!currentActivity) throw new Error('Fail to tertermine the current activity');

        const message = messageReaction.message
        const currentUser = await this.getUser();
        if (!currentUser) throw new Error('Fail to tertermine the current user');

        if (message.channel.id === this.channelId) {
            if (message.author.id === currentUser.id) {
                if (user.id !== currentUser.id) {
                    var component = await currentActivity.getComponentContext(message.id);

                    if (component) {
                        var reaction = await component.getReactionContext(messageReaction.emoji);

                        if (reaction) {
                            var event = new ReactionEvent('add', user, messageReaction);

                            await reaction._onAdd(event);
                            await this.update();
                        }
                    }
                }
            }
        }
    }

    private async onMessageReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) {
        const currentActivity = this.currentActivity
        if (!currentActivity) throw new Error('Fail to tertermine the current activity');

        const message = messageReaction.message
        const currentUser = await this.getUser();
        if (!currentUser) throw new Error('Fail to tertermine the current user');

        if (message.channel.id === this.channelId) {
            if (message.author.id === currentUser.id) {
                if (user.id !== currentUser.id) {
                    var component = await currentActivity.getComponentContext(message.id);

                    if (component) {
                        var reaction = await component.getReactionContext(messageReaction.emoji);

                        if (reaction) {
                            var event = new ReactionEvent('remove', user, messageReaction);

                            await reaction._onRemove(event);
                            await this.update();
                        }
                    }
                }
            }
        }
    }

    private async onMessage(message: Discord.Message) {
        const user = await this.getUser();
        if (!user) throw new Error('Fail to tertermine the current user');

        if (this._removeMessage) {
            if (message.channel.id === this.channelId) {
                if (message.author.id !== user.id) {
                    message.delete();
                }
            }
        }

        this.emit('message', message);
    }

    private async onUpdate() {
        this._updatePending--
        await this.render();

        this.emit('updated');
    }
}

export default DiscordActivity
export {
    Reaction,
    ReactionEvent,
    Activity,
    MessageComponent,
    MessageEmbedComponent,
}