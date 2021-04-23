import pino from "pino";
import {loggerConfig} from "./config/logger.config";
export const logger = pino(loggerConfig);