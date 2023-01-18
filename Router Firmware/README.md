# Instructions  

1. The .img and .sig files are the original bundled Release firmware from Jio that can be flashed through the WEB-UI.

2. The extracted firmwares are in the zip files respectively.

*We couldn't find the link to the JCO4032 Firmware.*

**WARNING : (THE EXTRACTED FIRMWARE IS FULL OF SYMLINKS, SO BE AWARE).**

## Structure of Firmware OTA Link

For example:-
`http://fota.slv.fxd.jiophone.net/ONT/Arcadyan/JCOW411/ARCNTF1_JCOW411_R2.3.img`

- `Arcadyan` can be replaced with `Sercomm`, etc according to the router.
- Change `JCOW411` with router model
- Change `ARCNTF1_JCOW411_R2.3.img` with router firmware name.
- You can also put `.sig` instead of `.img` to get the signed hash of the firmware.

*Special Thanks to [yashrastogi](https://broadbandforum.co/members/yashrastogi.81002/) for getting the [OTA URL of Jio STB](https://broadbandforum.co/threads/jio-stb-jhsd200-ota-link.209956/) and [RealEng1neer](https://github.com/RealEng1neer) for arranging the ONT Firmware Links.*
