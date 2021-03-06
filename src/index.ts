require('dotenv').config(); // Recommended way of loading dotenv
import container from "./config/inversify.config";
import {TYPES} from "./config/types";
import {Bot} from "./bot";

let bot: Bot = container.get<Bot>(TYPES.Bot);

bot.init().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error);
    process.exit(1);
});
