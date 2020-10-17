import type { MessageEmbedComponentProps, MessageEmbedComponentOptions, ComponentRendered } from '../../index';

import Discord from 'discord.js';

import Component, { format } from '../component';


class MessageEmbedComponent extends Component<MessageEmbedComponentOptions> {
    constructor(props?: MessageEmbedComponentProps) {
        super('messageEmbed', {}, {}, props && props.isHidden !== undefined ? props.isHidden : false, props?.name);
    }

    addField(name: Discord.StringResolvable, value: Discord.StringResolvable, inline?: boolean) {
        var fields = this.options.fields || [];
        var field: Discord.EmbedFieldData = {
            name,
            value
        }
        if (inline !== undefined) field.inline = inline;

        fields.push([
            field
        ]);
        
        return this.setOption('fields', fields);
    }
    addFields(...fields_: Discord.EmbedFieldData[] | Discord.EmbedFieldData[][]) {
        var fields: Discord.EmbedFieldData[][] = []

        for (var field of fields_) {
            if (field instanceof Array) {
                fields.push(field);
            } else {
                fields.push([
                    field
                ]);
            }
        }

        return this.setOption('fields', fields);
    }

    attachFiles(file: (Discord.MessageAttachment | Discord.FileOptions | string)[]) {
        return this.setOption('files', file);
    }

    setAuthor(name: Discord.StringResolvable, iconURL?: string, url?: string) {
        return this.setOption('author', {
            name,
            iconURL,
            url
        });
    }

    setColor(color: Discord.ColorResolvable) {
        return this.setOption('color', color);
    }

    setDescription(description: Discord.StringResolvable) {
        return this.setOption('description', description);
    }

    setFooter(text: Discord.StringResolvable, iconURL?: string) {
        return this.setOption('footer', {
            text,
            iconURL
        });
    }

    setImage(url: string) {
        return this.setOption('image', url);
    }

    setThumbnail(url: string) {
        return this.setOption('thumbnail', url);
    }

    setTimestamp(timestamp?: Date | number) {
        return this.setOption('timestamp', timestamp);
    }

    setTitle(title: Discord.StringResolvable) {
        return this.setOption('title', title);
    }

    setURL(url: string) {
        return this.setOption('url', url);
    }


    async render(): Promise<ComponentRendered | null | void> {
        var { fields, author, color, description, footer, image, thumbnail, timestamp, title, url } = this.options;
        var embed = new Discord.MessageEmbed();
        
        if (fields) embed.addFields(...formatFields(fields, this.states));
        if (author) embed.setAuthor(author.name, author.iconURL, author.url);
        if (color) embed.setColor(color);
        if (description) embed.setDescription(format(description, this.states));
        if (footer) embed.setFooter(format(footer.text, this.states), footer.iconURL);
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (timestamp) embed.setTimestamp(typeof timestamp === 'boolean' ? undefined : timestamp);
        if (title) embed.setTitle(format(title, this.states));
        if (url) embed.setURL(url);

        return embed
    }
}

export = MessageEmbedComponent

function formatFields(fields_: Discord.EmbedFieldData[][], states: object) {
    var fields: Discord.EmbedFieldData[][] = []
    
    for (var field of fields_) {
        var fields__: Discord.EmbedFieldData[] = []

        for (var field_ of field) {
            var field__: Discord.EmbedFieldData = {
                name: format(field_.name, states),
                value: format(field_.value, states)
            }
            if (field_.inline !== undefined) field__.inline = field_.inline;
            
            fields__.push(field__);
        }

        fields.push(fields__);
    }

    return fields
}