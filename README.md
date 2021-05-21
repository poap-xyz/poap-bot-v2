# @POAP-Bot: Code distribution for POAPs events

## Using @POAP-bot during events

During active events, users only need to send a DM to @POAP-bot

1. Obtain the secret password during the event.
2. Send a private message (DM) to @POAP-bot containing the secret password.
3. @POAP-bot will automatically reply with an unique URL to claim your POAP.

Example:
![POAP-bot DM delivery example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/dm_delivery_example.png?raw=true)

## Add @POAP-bot to your server.

You can add to you discord server the @POAP-bot with this link:
https://discord.com/oauth2/authorize?client_id=819190761437528124&scope=bot&permissions=2112

It will open the discord.com site in a browser page. Once the user signs in (which may happen automatically if credentials have been cached), they can select the guild in which the bot is to operate, and approve the bot's permissions in that guild.

The bot will appear as a new member of the server (check for __Poap Bot#2760__).

## Setting up new POAP Event

Administrators or users with a role called "POAP Master" may issue a command to the bot by mentioning it in __a text channel__, then adding the command in the message. Example:

`!setup` or `@POAP-bot !setup`

![POAP-bot setup init example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/start_setup_example.png?raw=true)

Note the bot will respond in a direct message dialog with the requesting user. Depending on the Discord client, the bot's _member_ name may be offered alongside its icon in a selection list when beginning to type the bot's name.

- _!setup_ Will initiate a dialog to set up a POAP event. Use this to create a new event.

Some aspects of a POAP distribution event are customisable, specifically:

- set the #channel to announce the beginning and end of an event
- the messages privately by the bot during the event.
- the start and end times (in UTC +0 time zone, with the following format: 2021-06-29 13:00)
- a file containing POAP codes (_Questions?_ Ask here -> https://t.me/poapxyz)

The bot will offer a default value for each parameter and it will be set if the response to the dialog is "-".

![POAP-bot setup example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/setup_example.png?raw=true)

## Get status from your events
- _!status_ Will respond in a direct message with the information of all configured events by the user.

Example:
![POAP-bot status example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/status_example.png?raw=true)

## Modifying an existing POAP Event
- _!addcodes {EVENT_ID}_ The user who created the event could add new codes sending a DM to the bot indicating the event ID (You can find it using the !status command) and attaching a new file with the new POAP codes.

- _!replacecodes {EVENT_ID}_ In the event of wrong configuration, the user who created the event should replace the codes by sending a DM to the bot indicating the event ID as the first parameter and attaching a file with the POAP codes to replace the old ones.

Example:
![POAP-bot addcodes example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/add_codes_example.png?raw=true)

Note: You can find the event ID using the !status command

## Subscribing a channel to the Poap Feed
- _!subscribe_ Administrators may issue this command to the bot by mentioning it in __a text channel__ and will automatically subscribe the channel to the feed in real-time of the claimed Poaps.

![POAP-bot feed example](https://github.com/poap-xyz/poap-bot-v2/blob/images/docs/examples/subscribe_feed_example.png?raw=true)

## Subscribing a channel to the Poap Feed
- _!unsubscribe_ Administrators may issue this command to the bot by mentioning it in __a text channel__ and will stop sending the embed messages to the channel. 

## Setup

Install dependencies & start:

    npm install
    npm run debug

### Development
Builds will be created on `dist` folder.

## Deployment

    docker-compose build
    docker-compose up -d

- Make sure to create a .env file using all configurations (see .env.sample)
