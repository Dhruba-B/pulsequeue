import { sleep } from "../utils/sleep.js";

export const reportProcessor = async (job) => {

    console.log("Generating report");

    await sleep(8000);

    console.log("Report generated");

    return {
        success: true
    };
};