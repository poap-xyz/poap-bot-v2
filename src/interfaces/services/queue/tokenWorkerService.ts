import {TokenMetadata} from "../../../models/poap/blockchain/tokenMetadata";
import {Worker} from "bullmq";

export interface TokenWorkerService {
    createWorker(): Worker;
}
