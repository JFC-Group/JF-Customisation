# Disable TR-069 (Does not work anymore)

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

**NOTE : JioCall/Landline/JioSTB/Firmware Auto Update/Changing WiFi settings from MyJio or JioHome apps won't work if TR-069 is disabled.**

1. First of all, follow [this guide](https://github.com/itsyourap/JioFiber-Home-Gateway/blob/master/Instructions/Decrypt-Router-Configuration-File.md) to get the router decrypted configuration file `RSTXXXXXXX_JCXXXXX.txt`
2. Open `RSTXXXXXXX_JCXXXXX.txt` with Notepad or other Text Editor.
3. **Find** the line 
`config.tr69["ManagementServer"][1]["URL"] = "https://acs.oss.jio.com:8443/ftacs-digest/ACS"`
and **replace** it with
`config.tr69["ManagementServer"][1]["URL"] = "http://127.0.0.1"`
4. **Find** the line
`config.tr69["ManagementServer"][1]["tr69Status"] = "1"`
and **replace** it with
`config.tr69["ManagementServer"][1]["tr69Status"] = "0"`
5. **Find** the line
`config.tr69["ManagementServer"][1]["PeriodicInformEnable"] = "1"`
and **replace** it with
`config.tr69["ManagementServer"][1]["PeriodicInformEnable"] = "0"`
6. Follow [this guide](https://github.com/itsyourap/JioFiber-Home-Gateway/blob/master/Instructions/Encrypt-Router-Configuration-File.md) to re-encrypt the configuration file and restore it via the router admin panel.
