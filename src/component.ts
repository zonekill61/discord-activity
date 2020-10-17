import type { Message, EmojiResolvable, TextChannel } from 'discord.js';
import type { State, ComponentRendered } from '../index';

import { EventEmitter } from 'events';
import equal from 'deep-equal';
import { v4 } from 'uuid';

import Button from './reactions/button';


export type ReactionType = Button
export default class Component<O = {}, S = {}> extends EventEmitter {
    private context: Message | null
    private state: State
    private type: string
    private isHidden: boolean
    private reactions: ReactionType[]
    private _prevRender: ComponentRendered | null
    
    reactionEnabled: Readonly<boolean> = true
    defaultOptions?: Partial<O>
    defaultStates?: Partial<S>
    options: O
    states: S
    
    isDeleted: boolean
    name: string | null
    id: string


    constructor(type: string, options: O, states: S, isHidden?: boolean, name?: string) {
        super();

        this.context = null;
        this.state = 'UNMOUNTED';
        this.type = type;
        this.options = options;
        this.states = states;
        this.isHidden = isHidden !== undefined ? isHidden : false;
        this.reactions = [];
        this._prevRender = null;
        
        this.isDeleted = false;
        this.name = name || null;
        this.id = v4();

        if (this.defaultOptions) Object.assign(this.options, this.defaultOptions);
        if (this.defaultStates) Object.assign(this.states, this.defaultStates);
    }

    isVisibile() {
        return !this.isHidden
    }

    isMount() {
        return this.state === 'MOUNTED'
    }

    setVisibile(visibile?: boolean) {
        this.isHidden = visibile !== undefined ? !visibile : !this.isHidden;
        this.update();

        return true
    }

    setOption(name: keyof O, value: any) {
        this.options[name] = value
        this.update();

        return true
    }

    setState(name: keyof S | Partial<S>, value?: any) {
        if (typeof name === 'string' && value) {
            this.states[name] = value
            this.update();

            return true
        } else if (typeof name === 'object') {
            Object.assign(this.states, name);
            this.update();

            return true
        }

        return false
    }

    getState(name: keyof S) {
        return this.states[name]
    }

    addReaction(reaction: ReactionType) {
        if (!this.reactionEnabled) throw new Error('reactions are disabled in this component');
        reaction.on('update', () => this.update());

        this.reactions.push(reaction);
        this.update();

        return reaction
    }

    addButton(emoji: EmojiResolvable, isHidden?: boolean) {
        if (!this.reactionEnabled) throw new Error('buttons are disabled in this component');
        var reaction = new Button(emoji, isHidden);
        this.addReaction(reaction);

        return reaction
    }

    async delete() {
        await this.unmount();
        this.emit('delete');
        this.isDeleted = true;

        return true
    }


    // Internal function
    async getReactionContext(emoji: EmojiResolvable) {
        if (!this.reactionEnabled) return null

        for (var reaction of this.reactions) {
            if (reaction.emoji.toString() === emoji.toString()) {
                return reaction
            }
        }

        return null
    }

    async getContext() {
        return await this.context?.fetch() || null;
    }

    async render(): Promise<ComponentRendered | null | void> { }

    async mountReaction(): Promise<boolean> {
        if (this.context && this.reactionEnabled) {
            for (var reaction of this.reactions) {
                reaction.mount(this.context);
            }
            this.emit('reactionMounted');

            return true
        } else {
            return false
        }
    }

    async mount(channel: TextChannel): Promise<boolean> {
        var isHidden = this.isHidden
        var type = this.type

        if (isHidden) {
            if (this.isMount()) {
                await this.unmount();
            }

            return false
        }
        var renderResult = await this.render();
        

        if (renderResult) {
            if (!this._prevRender || !equal(renderResult, this._prevRender)) {
                if (this.isMount() && this.context) {
                    this.context = await this.context.edit(renderResult);
                } else {
                    this.context = await channel.send(renderResult);
                }
            }
            await this.mountReaction();
            this._prevRender = renderResult
            this.state = 'MOUNTED'
            this.emit('mounted');
            
            return true
        } else {
            console.error('Failed to render component : invalid result' , this.type);
            return false
        }
    }

    async unmount(): Promise<boolean> {
        if (this.context) {
            await this.unmountReaction();
            await this.context.delete();
            this._prevRender = null
            this.context = null
            this.state = 'UNMOUNTED'
            this.emit('unmounted');

            return true
        } else {
            return false
        }
    }

    async unmountReaction(): Promise<boolean> {
        if (this.context) {
            for (var reaction of this.reactions) {
                await reaction.unmount();
            }
            this.emit('reactionUnmounted');

            return true
        } else {
            return false
        }
    }

    private async update() {
        this.emit('update');
    }
}

export function format(content: string, data: any) {
    var result = content

    for (var key in data) {
        result = result.replace(`{{${key}}}`, data[key]);
    }

    return result
}