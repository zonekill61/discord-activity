import type { EmojiResolvable, MessageReaction, User } from 'discord.js';

import Reaction, { ReactionEvent } from '../reaction';


export default class Button extends Reaction {
    constructor(emoji: EmojiResolvable, isHidden?: boolean) {
        super('button', emoji, isHidden);
    }

    async onAdd(event: ReactionEvent<'add'>) {
        this.emit('click', event);
    }

    async render(reactionContext: MessageReaction, currentUserId: string, users: User[]): Promise<void> {
        for (var user of users) {
            if (user.id !== currentUserId) {
                reactionContext.users.remove(user);
            }
        }
    }
}