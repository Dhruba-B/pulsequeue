import { sleep } from "../utils/sleep.js";

export const imageProcessor = async (job) => {

    console.log("Processing image:", job.payload.imageUrl);

    await sleep(5000);

    console.log("Image processed");

    return {
        success: true
    };
};