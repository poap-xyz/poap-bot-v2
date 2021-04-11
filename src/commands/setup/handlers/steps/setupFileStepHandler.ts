import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {BotConfig} from "../../../../config/bot.config";
import {logger} from "../../../../logger";
import {parseString} from "@fast-csv/parse";
import {Code} from "../../../../models/core/code";
import axios from "axios";
import {SetupAbstractHandler} from "./setupAbstractHandler";
import {CodeInput} from "../../../../models/input/codeInput";

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
        logger.info(`[FileSetupStep] File ${messageAttachment.name} ${messageAttachment.url} ${messageAttachment.id} is attached`);

        let codes: CodeInput[] = await this.readCsvAttachment(messageAttachment.url);
        setupState.event.setCodes(codes);
        setupState.event.setFileUrl(messageAttachment.url);

        return codes.toString();
    }

    private async readCsvAttachment(url: string): Promise<CodeInput[]>{
        try{
            const axiosResponse = await axios.get(url);
            const codesCsv = axiosResponse.data;
            const csvArray = await this.readCsvString(codesCsv);

            logger.debug(`[FileSetupStep] Response from attachment: ${codesCsv}`);
            logger.debug(`[FileSetupStep] CSV Array: ${csvArray}`);

            return csvArray;
        }catch (e){
            logger.error(`[FileSetupStep] Error fetching and parsing csv: ${e}`);
            return Promise.reject(e);
        }
    }

    private readCsvString(csv: string): Promise<CodeInput[]>{
        return new Promise<CodeInput[]>( (resolve, reject) => {
            const codes: CodeInput[] = [];
            const now = new Date();
            parseString(csv, {headers: false})
                .on('error', error => {
                    logger.error(`[FileSetupStep] Error parsing csv, error: ${error}`);
                    reject(error);
                })
                .on('data', row => {
                    logger.debug(`[FileSetupStep] CSV parse row: ${JSON.stringify(row)}`);
                    if(row.length){
                        codes.push({created_date: now, code: row[0]});
                    }
                })
                .on('end', (rowCount: number) => {
                    logger.debug(`[FileSetupStep] ${rowCount} rows`);
                    resolve(codes);
                });
        });
    }
}