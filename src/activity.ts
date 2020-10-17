import type { ActivityProps, ComponentTypes, ComponentProps, State } from '../index';

import { EventEmitter } from 'events';
import Discord from 'discord.js';
import { v4 } from 'uuid';

import { MessageComponent, MessageEmbedComponent } from './components';
import Component from './component';


export default class Activity extends EventEmitter {
    private components: Component[]
    private state: State

    name: string | null
    id: string

    constructor({ name, components }: {
        components?: Component[]
        name?: string
    }) {
        super();

        this.components = components || []
        this.state = 'UNMOUNTED'
        this.name = name || null;
        this.id = v4();
    }

    getComponent(componentId: string) {
        return this.components.find((i) => (i.name === componentId || i.id === componentId)) || null;
    }

    createComponent(type: ComponentTypes, props?: any) {
        var component: Component

        if (type === 'message') {
            component = new MessageComponent(props);
            this.addComponent(component);

            return component
        } else if (type === 'messageEmbed') {
            component = new MessageEmbedComponent(props);
            this.addComponent(component);

            return component
        } else {
            throw new Error("invalid component type");
        }
    }

    addComponent(component: Component) {
        this.components.push(component);
        component.on('update', () => this.update());
        component.on('delete', ((component: Component) => this.components = this.components.filter((i) => i.id !== component.id)).bind(component));

        return component
    }

    isMount() {
        return this.state === 'MOUNTED'
    }


    // Internal function
    async getComponentContext(contextId: string) {
        for (var component of this.components) {
            var context = await component.getContext();

            if (context && context.id === contextId) {
                return component
            }
        }

        return null
    }

    async mount(channel: Discord.TextChannel) {
        for (var component of this.components) {
            await component.mount(channel);
        }
        this.state = 'MOUNTED'
        this.emit('mounted');

        return true
    }

    async unmount() {
        for (var component of this.components) {
            await component.unmount();
        }
        this.state = 'UNMOUNTED'
        this.emit('unmounted');

        return true
    }

    private async update() {
        this.emit('update');
    }
}