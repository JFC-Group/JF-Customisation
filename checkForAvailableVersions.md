/*
Goto http://fota.slv.fxd.jiophone.net/
Run it in browser developer console, to get updated verisons,
replace router and current version According
*/


async function loadFirmwares() {
  const router = {
    manuf: "Sercomm",
    make: "JCOW414", 
    model: "SRCMTF1_JCOW414_R",
  };

  let currentVersion = 2.3;
  const futureVersion = 3;

  var num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
  });
  while (currentVersion < futureVersion) {
    const url = `http://fota.slv.fxd.jiophone.net/ONT/${router.manuf}/${
      router.make
    }/${router.model}${num.format(currentVersion)}.img`;
    await fetch(url).then((res) => {
      if (res.status == 200) {
        console.log(`${num.format(currentVersion)} : ${url}}`);
      }
    });
    currentVersion += 0.01;
  }
}
