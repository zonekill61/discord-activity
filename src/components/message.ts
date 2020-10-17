import type { MessageComponentProps, MessageComponentOptions, ComponentRendered } from '../../index';
import type { Message, TextChannel } from 'discord.js';

import Discord from 'discord.js';

import Component, { format } from '../component';


class MessageComponent extends Component<MessageComponentOptions> {
    constructor(props?: MessageComponentProps) {
        super('message', {}, {}, props && props.isHidden !== undefined ? props.isHidden : false, props?.name);
    }

    setContent(content: any) {
        return this.setOption('content', content);
    }

    async render(): Promise<ComponentRendered | null | void> {
        var { content, ...options } = this.options;
        
        return {
            ...options,
            content: content ? format(content, this.states) : ' ',
        }
    }
}

export = MessageComponent