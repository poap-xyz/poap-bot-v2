import {Token} from "../../../../models/poap/token";

export type ContractAction = "MINT" | "TRANSFER" | "BURN";

export interface ContractService {
    initListener();
}
