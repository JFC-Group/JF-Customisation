# Check Available Versions For Jio Router Firmwares

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

1. First go to `http://fota.slv.fxd.jiophone.net/` using your PC Browser.
2. Open Developer Tools and Click on the Console option.
3. At the top of the console window (just at the right of Filter box), you will find a spinner named `Custom levels`. Click it and turn off the `Error` checkbox.
4. Copy the script below and paste into the console.
5. In the console, edit the variables `router.manufacturer`, `router.model`, `router.firmwarePrefix`, `currentVersion` and `maxVersion` according to your needs.
6. Press Enter in the console which will show the Router Firmware versions along with their URLs.

```js
/*
1. Goto http://fota.slv.fxd.jiophone.net/
2. Replace router options and current and max versions accordingly
3. Run it in browser developer console, to scan for available firmware versions.
*/

var num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
});

function checkFirmwareExists(version, url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
            if (this.status !== 404){
              console.log(`${num.format(version)} : ${url}`);
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
    const url = `http://fota.slv.fxd.jiophone.net/ONT/${router.manufacturer}/${router.model}/${router.firmwarePrefix}${num.format(currentVersion)}.img`;
    checkFirmwareExists(currentVersion, url);
    currentVersion += 0.01;
  }
}

loadFirmwares();
```
