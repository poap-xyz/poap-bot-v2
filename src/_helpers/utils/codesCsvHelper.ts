import {CodeInput} from "../../models/input/codeInput";
import axios from "axios";
import {logger} from "../../logger";
import {parseString} from "@fast-csv/parse";

export class CodesCsvHelper{
    public static async readCsvAttachment(url: string): Promise<CodeInput[]>{
        try{
            const axiosResponse = await axios.get(url);
            const codesCsv = axiosResponse.data;
            const csvArray = await CodesCsvHelper.readCsvString(codesCsv);

            logger.debug(`[FileSetupStep] Response from attachment: ${codesCsv}`);
            logger.debug(`[FileSetupStep] CSV Array: ${csvArray}`);

            return csvArray;
        }catch (e){
            logger.error(`[FileSetupStep] Error fetching and parsing csv: ${e}`);
            return Promise.reject(e);
        }
    }

    private static readCsvString(csv: string): Promise<CodeInput[]>{
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