import { EventEmitter as _EventEmitter } from "events";
import Discord from "discord.js";


declare namespace discordActivity {
    export type State = 'MOUNTED' | 'UNMOUNTED'
    export interface ActivityClientProps {
        autoRemoveMessage?: boolean
        removeAllMessage?: boolean

        client?: Discord.Client
    }
    export interface DiscordActivityEvents {
        error: (error: Error) => void
        client_ready: () => void
        ready: () => void
        update: () => void
        updated: () => void
        
        mounted: (activity: Activity) => void
        unmounted: (activity: Activity) => void

        message: (message: Discord.Message) => void
    }
    export interface CreateActivityProps extends ActivityProps {
        isActive?: boolean
    }
    export class DiscordActivity extends EventEmitter<DiscordActivityEvents> {
        private channelId: string | null
        private _isReady: boolean

        private currentActivity: Activity | null
        private activity: Activity[]

        client: Discord.Client
        
        constructor(props?: ActivityClientProps): this

        async login(token: string, channelId: string): Promise<string>
        getActivity(activityId: string): Activity | null
        createActivity(props?: CreateActivityProps): Activity
        addActivity(activity: Activity, isActive?: boolean): Activity
        setActive(activityId: Activity | string): Activity | null


        // Internal function
        private async getChannel(): Promise<Discord.TextChannel | null>
        private async getUser(): Promise<Discord.ClientUser | null>
        private async render(): Promise<boolean>
        private async _clear(): Promise<boolean>
        private async update(): Promise<void>


        // Events
        private async onClientReady(): Promise<void>
        private async onMessageReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void>
        private async onMessageReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): Promise<void>
        private async onMessage(message: Discord.Message): Promise<void>

        
    }
    export default DiscordActivity



    export interface ActivityProps {
        components?: Component[]
        name?: string
    }
    export interface ActivityEvents {
        mounted: () => void
        unmounted: () => void
        update: () => void
    }
    export class Activity<E = ActivityEvents> extends EventEmitter<E> {
        private components: Component[]
        private state: State

        name: string | null
        id: string

        constructor({ name, components }: ActivityProps): this

        getComponent(componentId: string): MessageComponent | MessageEmbedComponent | Component<any, any> | null
        createComponent(type: 'message', props?: MessageComponentProps): MessageComponent
        createComponent(type: 'messageEmbed', props?: MessageEmbedComponentProps): MessageEmbedComponent
        createComponent(type: ComponentTypes, props?: any): MessageComponent | MessageEmbedComponent
        addComponent<C extends Component>(component: C): C
        isMount(): boolean


        // Internal function
        async getComponentContext(contextId: string): Promise<ComponentContext | null>
        async mount(channel: Discord.TextChannel): Promise<boolean>
        async unmount(): Promise<boolean>

        private async update(): Promise<void>
    }



    export interface BaseComponentProps {
        isHidden?: boolean
    }
    export type ComponentRendered = Discord.MessageOptions | (Discord.MessageOptions & { split?: false }) | Discord.MessageAdditions | Discord.APIMessage
    export type ComponentContext = Discord.Message
    export type ComponentTypes = 'message' | 'messageEmbed'
    export type ComponentProps = BaseComponentProps | MessageComponentProps | MessageEmbedComponentProps
    export interface ComponentEvents {
        mounted: () => void
        unmounted: () => void

        reactionMounted: () => void
        reactionUnmounted: () => void
        delete: () => void
        update: () => void
    }
    export class Component<O = {}, S = {}, E = ComponentEvents> extends EventEmitter<E> {
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


        constructor(type: string, options: O, states: S, isHidden?: boolean, name?: string): this

        isVisibile(): boolean
        isMount(): boolean
        setVisibile(visibile?: boolean): boolean
        setOption(name: keyof O, value: any): boolean
        setState(name: keyof S | Partial<S>, value?: any): boolean
        getState(name: keyof S): any
        addReaction(reaction: ReactionType): Button
        addButton(emoji: Discord.EmojiResolvable, isHidden?: boolean): Button

        async delete(): Promise<boolean>


        // Internal function
        async getReactionContext(emoji: Discord.EmojiResolvable): Promise<Button | null>
        async getContext(): Promise<Discord.Message | null>
        async render(channel: TextChannel): Promise<Message | null | void> { }
        async mountReaction(): Promise<boolean>
        async mount(channel: TextChannel): Promise<boolean>
        async unmount(): Promise<boolean>
        async unmountReaction(): Promise<boolean>

        private async update(): Promise<void>
    }



    export interface MessageComponentOptions extends Discord.MessageOptions {
        content?: string
    }
    export interface MessageComponentProps extends BaseComponentProps {
        name?: string
    }
    export class MessageComponent extends Component<MessageComponentOptions> {
        constructor(props?: MessageComponentProps): this

        setContent(content: any): boolean
        async render(): Promise<ComponentRendered | null | void>
    }



    export interface MessageEmbedComponentOptions extends Discord.MessageOptions {
        fields?: Discord.EmbedFieldData[][]
        author?: {
            name: Discord.StringResolvable
            iconURL?: string
            url?: string
        }
        color?: Discord.ColorResolvable
        description?: Discord.StringResolvable
        footer?: {
            text: Discord.StringResolvable
            iconURL?: string
        }
        image?: string
        thumbnail?: string
        timestamp?: Date | number | true
        title?: Discord.StringResolvable
        url?: string
    }
    export interface MessageEmbedComponentProps extends BaseComponentProps {
        name?: string
    }
    export class MessageEmbedComponent extends Component<MessageEmbedComponentOptions> {
        constructor(props?: MessageEmbedComponentProps): this

        addField(name: Discord.StringResolvable, value: Discord.StringResolvable, inline?: boolean): boolean;
        addFields(...fields: Discord.EmbedFieldData[] | Discord.EmbedFieldData[][]): boolean;
        attachFiles(file: (Discord.MessageAttachment | Discord.FileOptions | string)[]): boolean;
        setAuthor(name: Discord.StringResolvable, iconURL?: string, url?: string): boolean;
        setColor(color: Discord.ColorResolvable): boolean;
        setDescription(description: Discord.StringResolvable): boolean;
        setFooter(text: Discord.StringResolvable, iconURL?: string): boolean;
        setImage(url: string): boolean;
        setThumbnail(url: string): boolean;
        setTimestamp(timestamp?: Date | number): boolean;
        setTitle(title: Discord.StringResolvable): boolean;
        setURL(url: string): boolean;


        async render(): Promise<ComponentRendered | null | void>
    }



    export type ReactionEventType = 'add' | 'remove'
    export interface ReactionEvents {
        mounted: () => void
        unmounted: () => void
        
        update: () => void
    }
    export class Reaction<E = ReactionEvents> extends EventEmitter<E> {
        private lastEvent: Date | null
        private cooldown: number
        private context: Message | null
        private isHidden: boolean
        private state: State

        type: string
        emoji: Discord.EmojiResolvable


        constructor(type: string, emoji: Discord.EmojiResolvable, isHidden?: boolean, cooldown?: number): this

        isVisibile(): boolean
        setVisibile(visibile?: boolean): boolean
        setCooldown(cooldown: number): boolean
        isMount(): boolean


        // Events dispatch
        async onAdd(event: ReactionEvent<'add'>): Promise<void>
        async onRemove(event: ReactionEvent<'remove'>): Promise<void>

        async _onAdd(event: ReactionEvent<'add'>): Promise<void>
        async _onRemove(event: ReactionEvent<'remove'>): Promise<void>

        async render(reactionContext: Discord.MessageReaction, currentUserId: string, users: Discord.User[]): Promise<void>

        // Internal function
        async getContext(): Promise<Discord.Message | null>
        async getReactionContext(): Promise<Discord.MessageReaction | null>
        async mount(context: Message): Promise<boolean>
        async unmount(): Promise<boolean>

        private async update(): Promise<void>
    }

    export class ReactionEvent<Type extends ReactionEventType> {
        type: Readonly<Type>
        user: Readonly<Discord.User | Discord.PartialUser>
        reaction: Discord.MessageReaction
        message: Discord.Message

        constructor(type: Type, user: Discord.User | Discord.PartialUser, reaction: Discord.MessageReaction): this
    }



    export interface ButtonEvents extends ReactionEvents {
        click: (event: ReactionEvent<'add'>) => void
    }
    export class Button extends Reaction<ButtonEvents> {
        constructor(emoji: Discord.EmojiResolvable, isHidden?: boolean): this


        // Internal function
        async onAdd(event: ReactionEvent<'add'>): Promise<void>
    }

}

declare module 'discord-activity' {
    export = discordActivity
}

export = discordActivity

// Typed EventEmitter
class EventEmitter<E> extends _EventEmitter {
    addListener<K extends keyof E>(event: K, listener: E[K]): this;
    on<K extends keyof E>(event: K, listener: E[K]): this;
    once<K extends keyof E>(event: K, listener: E[K]): this;

    removeListener<K extends keyof E>(event: K, listener: E[K]): this;
    off<K extends keyof E>(event: K, listener: E[K]): this;
    removeAllListeners<K extends keyof E>(event?: K): this;

    listeners<K extends keyof E>(event: K): Function[];
    rawListeners<K extends keyof E>(event: K): Function[];

    prependListener<K extends keyof E>(event: K, listener: E[K]): this;
    prependOnceListener<K extends keyof E>(event: K, listener: E[K]): this;
}