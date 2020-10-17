import type { Message, EmojiResolvable, MessageReaction, User, PartialUser } from 'discord.js';
import type { State, ReactionEventType } from '../index';

import { EventEmitter } from 'events';


export default class Reaction extends EventEmitter {
    private lastEvent: Date | null
    private cooldown: number
    private context: Message | null
    private isHidden: boolean
    private state: State

    type: string
    emoji: EmojiResolvable


    constructor(type: string, emoji: EmojiResolvable, isHidden?: boolean, cooldown?: number) {
        super();

        this.lastEvent = null
        this.cooldown = cooldown || Infinity
        this.context = null
        this.isHidden = isHidden !== undefined ? isHidden : false
        this.state = 'UNMOUNTED'

        this.type = type
        this.emoji = emoji
    }

    isVisibile() {
        return !this.isHidden
    }

    setVisibile(visibile?: boolean) {
        this.isHidden = visibile !== undefined ? !visibile : !this.isHidden;
        this.update();

        return true
    }

    setCooldown(cooldown: number) {
        this.cooldown = cooldown

        return true
    }

    isMount() {
        return this.state === 'MOUNTED'
    }


    // Events dispatch
    async onAdd(event: ReactionEvent<'add'>) { }
    async onRemove(event: ReactionEvent<'remove'>) { }

    async _onAdd(event: ReactionEvent<'add'>) {
        var lastEvent = this.lastEvent
        var cooldown = this.cooldown

        this.lastEvent = (new Date);

        if (lastEvent) {
            if ((new Date).getTime() >= (lastEvent.getTime() + cooldown)) {
                this.onAdd(event);
            }
        } else {
            this.onAdd(event);
        }
    }
    async _onRemove(event: ReactionEvent<'remove'>) {
        var lastEvent = this.lastEvent
        var cooldown = this.cooldown

        if (lastEvent) {
            if ((new Date).getTime() >= (lastEvent.getTime() + cooldown)) {
                this.onRemove(event);
                this.lastEvent = (new Date);
            }
        } else {
            this.onRemove(event);
        }
    }

    async render(reactionContext: MessageReaction, currentUserId: string, users: User[]) {}

    // Internal function
    async getContext() {
        return await this.context?.fetch() || null;
    }

    async getReactionContext() {
        if (this.context) {
            for (var message of (await this.context.reactions.cache.array())) {
                if (message.emoji.toString() === this.emoji.toString()) {
                    return message
                }
            }

            return null
        } else {
            return null
        }
    }

    async mount(context: Message) {
        var isHidden = this.isHidden

        if (context) {
            if (isHidden) {
                if (this.isMount()) {
                    await this.unmount();
                }

                return false
            }

            var reactionContext = await this.getReactionContext();
            var currentUserId = context.author.id

            if (reactionContext) {
                var users = (await reactionContext.users.fetch()).array();
                await this.render(reactionContext, currentUserId, users);

                if (users.findIndex((i) => i.id === currentUserId) >= 0) {
                    await context.react(this.emoji);
                }
            } else {
                await context.react(this.emoji);
            }

            this.context = context
            this.state = 'MOUNTED'
            this.emit('mounted');

            return true
        } else {
            return false
        }
    }

    async unmount() {
        if (this.context) {
            var messageReaction = await this.context.reactions.cache.array()

            for (var message of messageReaction) {
                if (message.emoji.toString() === this.emoji.toString()) {
                    await message.remove();
                    break;
                }
            }
            this.context = null
            this.state = 'MOUNTED'
            this.emit('unmounted');

            return true
        } else {
            return false
        }
    }

    private async update() {
        this.emit('update');
    }
}

export class ReactionEvent<Type extends ReactionEventType> {
    type: Readonly<Type>
    user: Readonly<User | PartialUser>
    reaction: MessageReaction
    message: Message

    constructor(type: Type, user: User | PartialUser, reaction: MessageReaction) {
        this.type = type
        this.user = user
        this.reaction = reaction
        this.message = reaction.message
    }
}