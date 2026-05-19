import { JOB_TYPES }
    from "../../../../packages/shared/src/constants/jobConstants.js";
import { emailProcessor } from "./emailProcessor.js";
import { imageProcessor } from "./imageProcessor.js";
import { reportProcessor } from "./reportProcessor.js";



export const processorMap = {

    [JOB_TYPES.EMAIL]: emailProcessor,

    [JOB_TYPES.IMAGE_PROCESS]: imageProcessor,

    [JOB_TYPES.REPORT_GENERATION]: reportProcessor
};