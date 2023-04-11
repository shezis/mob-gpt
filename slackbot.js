const { App } = require('@slack/bolt');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

let mobParticipants = [];
let mobTimeLimit = 10; // time limit for each person in minutes
let currentMobIndex = 0; // index of current mob member in the array

function startMobSession(channelId) {
  // Start a new mob session
  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: 'Starting a new mob session!'
  });
}

function addMobParticipants(channelId, participants) {
  // Add participants to the mob session
  mobParticipants.push(...participants);
  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: `Adding ${participants.join(', ')} to the mob session!`
  });
}

function endMobSession(channelId) {
  // End the mob session
  mobParticipants = [];
  currentMobIndex = 0;
  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: 'Ending the mob session!'
  });
}

function rotateMobParticipant(channelId) {
  // Rotate to the next mob member
  currentMobIndex = (currentMobIndex + 1) % mobParticipants.length;
  const nextMobMember = mobParticipants[currentMobIndex];
  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: `It's ${nextMobMember}'s turn now!`
  });
}

function notifyNewMobMember(channelId) {
  // Notify the channel when a new mob member is selected
  const currentMobMember = mobParticipants[currentMobIndex];
  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    text: `It's ${currentMobMember}'s turn now!`
  });
}

app.command('/mob', async ({ command, ack, say, context }) => {
  // Start a new mob session
  await ack();
  startMobSession(command.channel_id);
});

app.command('/mob-add', async ({ command, ack, say, context }) => {
  // Add participants to the mob session
  await ack();
  const participants = command.text.split(' ');
  addMobParticipants(command.channel_id, participants);
});

app.command('/mob-end', async ({ command, ack, say, context }) => {
  // End the mob session
  await ack();
  endMobSession(command.channel_id);
});

app.command('/mob-rotate', async ({ command, ack, say, context }) => {
  // Rotate to the next mob member
  await ack();
  rotateMobParticipant(command.channel_id);
});

setInterval(() => {
  if (mobParticipants.length > 0) {
    const currentMobMember = mobParticipants[currentMobIndex];
    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: command.channel_id,
      text: `Time's up, ${currentMobMember}! Rotate to the next member with /mob-rotate.`
    });
    rotateMobParticipant(command.channel_id);
  }
}, mobTimeLimit * 60 * 1000); // run every mobTimeLimit minutes

app.action('mob-add-button', async ({ body, ack, say, context }) => {
  // Add a participant to the mob session when button is clicked
  await ack();
  const participant = body.actions[0].value;
  addMobParticipants(body.channel.id, [participant]);
});

app.action('mob-rotate-button', async ({ body, ack, say, context }) => {
  // Rotate to the next mob member when button is clicked
  await ack();
  rotateMobParticipant(body.channel.id);
});

app.action('mob-end-button', async ({ body, ack, say, context }) => {
  // End the mob session when button is clicked
  await ack();
  endMobSession(body.channel.id);
});

app.shortcut('mob', async ({ shortcut, ack, context }) => {
  // Show a modal to start a new mob session
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'mob_start_modal',
        title: {
          type: 'plain_text',
          text: 'Start a new mob session'
        },
        submit: {
          type: 'plain_text',
          text: 'Start'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'participants_block',
            element: {
              type: 'multi_users_select',
              action_id: 'participants_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select participants'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Participants'
            }
          },
          {
            type: 'input',
            block_id: 'time_limit_block',
            element: {
              type: 'static_select',
              action_id: 'time_limit_select',
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '5 minutes'
                  },
                  value: '5'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '10 minutes'
                  },
                  value: '10'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '15 minutes'
                  },
                  value: '15'
                }
              ]
            },
            label: {
              type: 'plain_text',
              text: 'Time limit per person'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.view('mob_start_modal', async ({ ack, body, view, context }) => {
  // Start a new mob session with the selected participants and time limit
  await ack();
  const participants = view.state.values.participants_block.participants_select.selected_users;
  const timeLimit = parseInt(view.state.values.time_limit_block.time_limit_select.selected_option.value);
  mobTimeLimit = timeLimit;
  mobParticipants = participants;
  startMobSession(body.channel.id);
});

app.event('member_joined_channel', async ({ event, context }) => {
  // Notify the channel when a new member joins the mob session
  if (mobParticipants.includes(event.user)) {
    notifyNewMobMember(event.channel);
  }
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  console.log('App is running!');
})();
