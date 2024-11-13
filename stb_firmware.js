/*
Example Link : http://fota.slv.fxd.jiophone.net/STB/Droidlogic/JHSD200/STB-JHSD200-7.4.6.zip
1. Goto http://fota.slv.fxd.jiophone.net/
2. Replace STB options and current and max versions, and increment accordingly (Do not put to much difference between those numbers)
3. Run it in browser developer console, to scan for available firmware versions.
*/

function checkFirmwareExists(version, url) {
    const http = new XMLHttpRequest();
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

function loadFirmwares() {
    const STB = {
        manufacturer: "Droidlogic", // Change this according to your need
        model: "JHSD200" // Change this according to your need
    };

    let currentVersion = "7.0.0"; // Change this according to your need
    const increment = "0.0.1" // Change this according to your need
    const maxVersion = "8.0.0"; // Keep the difference within 2.0.0.0 otherwise your PC will not have enough bandwidth and resources to check all links

    while (compareVersions(currentVersion, maxVersion)) {
        const url = `http://fota.slv.fxd.jiophone.net/STB/${STB.manufacturer}/${STB.model}/STB-${STB.model}-${currentVersion}.zip`;
        checkFirmwareExists(currentVersion, url);
        currentVersion = incrementVersion(currentVersion, increment)
    }
}

function compareVersions(ver1, ver2) {
    return parseInt(ver1.split(".").join()) < parseInt(ver2.split(".").join());
}

function incrementVersion(ver, increment) {
    const splitVer = ver.split(".");
    const splitIncrement = increment.split(".");
    let carry = 0;
    for (let i = (splitVer.length - 1); i >= 0; i--) {
        splitVer[i] = (parseInt(splitVer[i]) + parseInt(splitIncrement[i]) + carry).toString();
        carry = 0;
        if ((i !== 0) && splitVer[i] >= 10) {
            carry = Math.trunc(parseInt(splitVer[i]) / 10);
            splitVer[i] = (parseInt(splitVer[i]) % 10).toString();
        }
    }

    return splitVer.join(".");
}

loadFirmwares();