import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {BotConfig} from "../../../../config/bot.config";
import {logger} from "../../../../logger";
import {parseString} from "@fast-csv/parse";
import {Code} from "../../../../models/code";
import axios from "axios";
import {SetupAbstractHandler} from "./setupAbstractHandler";

export class SetupFileStepHandler extends SetupAbstractHandler{
    constructor() {
        super('FILE');
    }

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Please attach your links.txt file`);
    }

    async handler(message: Message, setupState: SetupState): Promise<string> {
        if (message.attachments.size <= 0) {
            await setupState.dmChannel.send(`No file attachment found!`);
            return Promise.reject("Invalid file step, no file attached");
        }

        const messageAttachment = message.attachments.first();
        logger.info(`[STEPS] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);

        let codes: Code[] = await this.readCsvAttachment(messageAttachment.url);
        setupState.event.setCodes(codes);
        setupState.event.setFileUrl(messageAttachment.url);

        return codes.toString();
    }

    private async readCsvAttachment(url: string): Promise<Code[]>{
        try{
            const axiosResponse = await axios.get(url);
            const codesCsv = axiosResponse.data;
            return await this.readCsvString(codesCsv);
        }catch (e){
            logger.error(`Error fetching and parsing csv: ${e}`);
            return Promise.reject(e);
        }
    }

    private readCsvString(csv: string): Promise<Code[]>{
        return new Promise<Code[]>( (resolve, reject) => {
            const codes: Code[] = [];
            parseString(csv, {headers: true})
                .on('error', error => {
                    logger.error(`Error parsing csv, error: ${error}`);
                    reject(error);
                })
                .on('data', row => {
                    logger.debug(`CSV parse row: ${row}`);
                    if(row && row[0])
                        codes.push(row[0]);
                })
                .on('end', (rowCount: number) => {
                    logger.debug(`Parsed ${rowCount} rows`);
                    resolve(codes);
                });
        });
    }
}