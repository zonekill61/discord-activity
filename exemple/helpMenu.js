require('dotenv').config();
const { DiscordActivity } = require('..');
const Discord = require('discord.js');


const activityClient = new DiscordActivity();

var mainActivity = activityClient.createActivity({
    isActive: true
});

var component = mainActivity.createComponent('messageEmbed', {
    isHidden: true
});
component.setTitle("Help Menu");
component.setAuthor("My server name");
component.setThumbnail('https://github.com/google/material-design-icons/raw/master/png/action/help/materialicons/24dp/2x/baseline_help_black_24dp.png');
component.setDescription('Display all available commands');
component.addFields([
    {
        name: '\u200b',
        value: '\u200b'
    },
    {
        name: '!help',
        value: 'Show this menu',
        inline: true
    },
    {
        name: '!ban :username:',
        value: 'Banish Someone',
        inline: true
    },
    {
        name: '!ban :username:',
        value: 'Banish Someone',
        inline: true
    },
    {
        name: '!mute :username:',
        value: 'Mute Someone',
        inline: true
    },
    {
        name: '!kick :username:',
        value: 'Exclude Someone',
        inline: true
    }
])

var closeButton = component.addButton('❌');
closeButton.setCooldown(1000);

closeButton.on('click', (event) => {
    console.log('Close button click by', event.user.username);

    component.setVisibile(false);
});


activityClient.on('ready', async () => {
    console.log('Client ready');
});

activityClient.on('error', async (err) => {
    console.log('Client error');
    console.error(err);
});

activityClient.on('message', (message) => {
    if (message.content === '!help') {
        component.setVisibile(true);
    }
});

activityClient.login(process.env.TOKEN, process.env.CHANNEL_ID);