# Discord Activity
discord-activity is a tool to create discord bot more easily.

## Installation

```bash
$ npm install discord-activity
```

## Summary

- [General info](#general-info)
- [Exemple](#exemple)
    - [Exemple Game Server](#exemple-game-server)
    - [Exemple Help Menu](#exemple-help-menu)
- [Documentation](#documentation)

# General Info

With discord-activity you can create a message with a reaction that will serve as a button, you can also put states in the messages e.g. {{myState}} to create a dynamic message that changes according to the status of a game server, a quiz, a bot for moderation, see example below.

# Exemple

## Exemple Game Server

this is an example to display the status of a game server, full exmple [here](https://github.com/zonekill61/discord-activity/blob/master/exemple/gameServer.js)

![](https://raw.githubusercontent.com/zonekill61/discord-activity/master/exemple/assets/gameServerExemple.gif)

```javascript
const { DiscordActivity } = require('discord-activity');
const activityClient = new DiscordActivity();

var mainActivity = activityClient.createActivity({
    isActive: true
});

var component = mainActivity.createComponent('messageEmbed');
component.setTitle("My garry's mod server");
component.addField('Status', 'Server is {{serverState}} with {{slot}} players connected out of {{max_slot}}');
component.addField('CPU Usage', '{{cpu}}', true);
component.addField('RAM Usage', '{{ram}}', true);

// Set color ex: is started green or red if not
component.setColor(0x00FF00); // set color to green

// set default states
component.setState('cpu', '0%');
component.setState('ram', '0G');
component.setState('slot', '0');
component.setState('max_slot', '100');
component.setState('serverState', 'on');

var startButton = component.addButton('✅');
stopButton.on('click', () => MyServerControler.startServer());

var stopButton = component.addButton('❌');
stopButton.on('click', () => MyServerControler.stopServer());

activityClient.on('ready', async () => {
    console.log('Client ready');

    MyServerControler.on('data', (data) => {
        if (data.isOnline) {
            component.setState('cpu', data.cpuUsage);
            component.setState('ram', data.ramUsage);
            component.setState('slot', data.slot);
            component.setState('max_slot', data.maxSlot);
            component.setState('serverState', 'on');
            component.setColor(0x00FF00); // set color to green
        } else {
            component.setState('cpu', 'N/A');
            component.setState('ram', 'N/A');
            component.setState('slot', 'N/A');
            component.setState('max_slot', 'N/A');
            component.setState('serverState', 'off');
            component.setColor(0xFF0000); // set color to red
        }
    });
});

activityClient.login(process.env.TOKEN, process.env.CHANNEL_ID);
```

## Exemple Help Menu

You can also create messages that will display all available commands., full exmple [here](https://github.com/zonekill61/discord-activity/blob/master/exemple/helpMenu.js)

![](https://raw.githubusercontent.com/zonekill61/discord-activity/master/exemple/assets/helpMenuExemple.png)

```javascript
const { DiscordActivity } = require('discord-activity');
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
component.addField('!ban :username:', 'Ban Someone', true);
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
```

# Documentation

there is no documentation yet but I am working on it

## License
[MIT](https://choosealicense.com/licenses/mit/)