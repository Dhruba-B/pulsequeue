import { AI_JOB_TYPES } from "../../../shared/src/constants/aiJobTypes.js";

import { summarizeExecutor } from "./summarizeExecutor.js";

import { embedExecutor } from "./embedexecutor.js";

import { classifyExecutor } from "./classifyExecutor.js";

import { ocrExecutor } from "./ocrExecutor.js";

import { translateExecutor } from "./translateExecutor.js";

export const AI_EXECUTORS = {
    [AI_JOB_TYPES.SUMMARIZE]: summarizeExecutor,

    [AI_JOB_TYPES.EMBED]: embedExecutor,

    [AI_JOB_TYPES.CLASSIFY]: classifyExecutor,

    [AI_JOB_TYPES.OCR]: ocrExecutor,

    [AI_JOB_TYPES.TRANSLATE]: translateExecutor,
};
