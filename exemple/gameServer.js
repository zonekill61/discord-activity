require('dotenv').config();
const { DiscordActivity } = require('..');

const offColor = 0xff0000;
const onColor = 0x00ff00;

const activityClient = new DiscordActivity();

var mainActivity = activityClient.createActivity({
    isActive: true
});

var component = mainActivity.createComponent('messageEmbed');
component.setTitle("My garry's mod server");
component.addField('Status', 'Server is {{serverState}} with {{slot}} players connected out of {{max_slot}}');
component.addField('CPU Usage', '{{cpu}}', true);
component.addField('RAM Usage', '{{ram}}', true);
component.setColor(onColor);
setServerState('on', '0%', '0G', '0', '100');

var startButton = component.addButton('✅');
startButton.setCooldown(1000);
startButton.setVisibile(false);

var stopButton = component.addButton('❌');
stopButton.setCooldown(1000);

startButton.on('click', (event) => {
    console.log('Start button click by', event.user.username);

    startButton.setVisibile(false);
    stopButton.setVisibile(true);

    setServerState('on', '0%', '0G', '0', '100');
});

stopButton.on('click', (event) => {
    console.log('Stop button click by', event.user.username);

    startButton.setVisibile(true);
    stopButton.setVisibile(false);
    setServerState('off');
});

activityClient.on('ready', async () => {
    console.log('Client ready');
    updateSlot()

    setInterval(async () => {
        if (component.getState('serverState') === 'on') {
            var cpu = Math.trunc(Math.random() * 100);
            var ram = Math.random() * 10;

            setServerState('on', `${cpu}%`, `${ram.toFixed(1)}G`);
        }
    }, 1500);
});

activityClient.on('error', async (err) => {
    console.log('Client error');
    console.error(err);
});

activityClient.login(process.env.TOKEN, process.env.CHANNEL_ID);

function updateSlot() {
    setTimeout(async () => {
        if (component.getState('serverState') === 'on') {
            var currentSlot = component.getState('slot');

            if (Math.random() > 0.5) {
                if (currentSlot + 1 <= 100) {
                    currentSlot++
                }
            } else {
                if (currentSlot - 1 >= 0) {
                    currentSlot--
                }
            }

            setServerState('on', null, null, currentSlot);
            updateSlot()
        }
    }, Math.floor(Math.random() * 10000));
}

function setServerState(state = 'on', cpu, ram, slot, max_slot) {
    if (cpu || state !== 'on') component.setState('cpu', state === 'on' ? cpu : 'N/A');
    if (ram || state !== 'on') component.setState('ram', state === 'on' ? ram : 'N/A');
    if (slot || state !== 'on') component.setState('slot', state === 'on' ? slot : 'N/A');
    if (max_slot || state !== 'on') component.setState('max_slot', state === 'on' ? max_slot : 'N/A');
    component.setColor(state === 'on' ? onColor : offColor);
    component.setState('serverState', state);
}