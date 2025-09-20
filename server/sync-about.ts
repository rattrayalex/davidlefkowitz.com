import { syncAboutPage } from "./sync";

async function main() {
    try {
        console.log("Starting About page sync...");
        await syncAboutPage();
        console.log("About page sync completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error during About sync:", error);
        process.exit(1);
    }
}

main();