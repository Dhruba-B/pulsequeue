import { createJobObject }
    from "../../../../packages/shared/src/schemas/jobSchemas.js";

import { addJobToQueue }
    from "../../../../packages/queue-core/src/queueService.js";

export const createJob = async (req, res) => {

    try {

        const job = createJobObject(req.body);

        await addJobToQueue(job);

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