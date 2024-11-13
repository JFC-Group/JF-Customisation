/*
1. Goto http://fota.slv.fxd.jiophone.net/
2. Replace router options and current and max versions accordingly
3. Run it in browser developer console, to scan for available firmware versions.
*/

function precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function checkFirmwareExists(version, url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
            if (this.status !== 404) {
                console.log(`${version} : ${url}`);
            }
        }
    };
    http.send();
}

async function loadFirmwares() {
    const router = {
        manufacturer: "Sercomm", // Replace this with your Router Manufacturer (Sercomm, Skyworth, Arcadyan, etc...)
        model: "JCOW414",  // Replace this with your Router Model Name (JCOW414, JCOW411, etc...)
        firmwarePrefix: "SRCMTF1_JCOW414_R", // Replace this with your Router Firmware Version Prefix (SRCMTF1_JCOW414_R, SKYWTF1_JCOW407_R, ARCNTF1_JCOW411_R, etc...)
    };

    let currentVersion = 2.3;
    const maxVersion = 3;

    while (currentVersion < maxVersion) {
        const url = `http://fota.slv.fxd.jiophone.net/ONT/${router.manufacturer}/${router.model}/${router.firmwarePrefix}${precisionRound(currentVersion, 2)}.img`;
        checkFirmwareExists(precisionRound(currentVersion, 2), url);
        currentVersion += 0.01;
    }
}

loadFirmwares();