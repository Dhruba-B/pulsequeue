import { createJobObject }
    from "../../../../packages/shared/src/schemas/jobSchemas.js";

import { addJobToQueue }
    from "../../../../packages/queue-core/src/queueService.js";
import { emitJobCreated } from "../services/socketEvents.js";
import { AI_JOB_TYPES }
    from "../../../../packages/shared/src/constants/aiJobTypes.js";

const SUPPORTED_AI_JOB_TYPES = new Set(Object.values(AI_JOB_TYPES));

export const createJob = async (req, res) => {

    try {
        if (!SUPPORTED_AI_JOB_TYPES.has(req.body?.type)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported AI execution type"
            });
        }

        const job = createJobObject(req.body);

        await addJobToQueue(job);

        emitJobCreated(job);

        return res.status(201).json({
            success: true,
            data: job
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create job"
        });
    }
};
