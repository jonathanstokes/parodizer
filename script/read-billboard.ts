import {Top40Service} from "../server/src/service/Top40Service";

const doIt = async () => {
    const top40Service = new Top40Service();
    await top40Service.writeChartCache();
};
doIt().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});

