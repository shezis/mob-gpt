# Slack Mob Sessions Plugin

This is a Slack plugin that enables you to run mob sessions with your team directly within Slack. A mob session is a collaborative programming technique in which a group of developers work together on a single codebase, rotating the person who is typing every few minutes. 

## Features

The Slack Mob Sessions Plugin has the following features:

- Start a new mob session with `/mob` command.
- Add participants to the mob session with `/mob-add` command.
- End the mob session with `/mob-end` command.
- Rotate to the next mob member with `/mob-rotate` command.
- Time management feature that ensures that each mob participant works on the codebase for the same amount of time.
- Notification when a new mob member is selected.

## Installation and Usage

To use the Slack Mob Sessions Plugin, you'll need to follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies by running the following command in your terminal:

    ```bash
    npm install
    ```

3. Create a new Slack app in the Slack API console.
4. Install the app to your workspace.
5. Copy the `SLACK_APP_TOKEN` and `SLACK_BOT_TOKEN` from your app's "Install App" page and add them as environment variables in your hosting provider.
6. Deploy the Node.js app to a hosting provider of your choice, such as Heroku, AWS, or Google Cloud.
7. Ensure that the app is accessible via HTTPS.
8. Add a new webhook URL to the app's "Event Subscriptions" page in the Slack API console. This should point to the URL where your deployed Node.js app is running.
9. Add the required bot scopes to your app on the "OAuth & Permissions" page in the Slack API console.
10. Install the app to your workspace by clicking the "Install App" button on the "Manage Distribution" page in the Slack API console.

Once you've completed these steps, you should be able to interact with the bot in your Slack workspace by using the commands and buttons specified in the code.

## License

This project is licensed under the terms of the MIT license.

### MIT License

MIT License

