import { sleep } from "../utils/sleep.js";

export const emailProcessor = async (job) => {

    console.log("Sending email to:", job.payload.to);

    await sleep(3000);

    // Simulates random failure
    const random = Math.random();

    if (random < 0.7) {

        throw new Error("SMTP Connection Failed");
    }

    console.log("Email sent");

    return {
        success: true
    };
};