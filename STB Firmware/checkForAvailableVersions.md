# Check Available Versions For Jio STB Firmwares

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

1. First go to `http://fota.slv.fxd.jiophone.net/` using your PC Browser.
2. Open Developer Tools and Click on the Console option.
3. At the top of the console window (just at the right of Filter box), you will find a spinner named `Custom levels`. Click it and turn off the `Error` checkbox.
4. Copy the script below and paste into the console.
5. In the console, edit the variables `STB.manufacturer`, `STB.model`, `currentVersion`, `maxVersion` and `increment` according to your need.
6. Press Enter in the console which will show the STB Firmware versions along with their URLs.

```js
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
    for (let i = (splitVer.length - 1); i >= 0; i--){
        splitVer[i] = (parseInt(splitVer[i]) + parseInt(splitIncrement[i]) + carry).toString();
        carry = 0;
        if ((i !== 0) && splitVer[i] >= 10){
            carry = Math.trunc(parseInt(splitVer[i]) / 10);
            splitVer[i] = (parseInt(splitVer[i]) % 10).toString();
        }
    }

    return splitVer.join(".");
}

loadFirmwares();
```