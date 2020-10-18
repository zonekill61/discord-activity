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
component.addField('\u200b', '\u200b');
component.addField('!help', 'Show this menu', true);
component.addField('!ban :username:', 'Show this menu', true);
component.addField('!mute :username:', 'Mute Someone', true);
component.addField('!kick :username:', 'Exclude Someone', true);

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