# Enable FTP (Does not work anymore)

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

**NOTE:  FTP username will be admin & password will be your admin password in WEB-UI (Router Configuration Page)**

1. First of all, follow [this guide](https://github.com/JFC-Group/JF-Customisation/blob/master/Instructions/Decrypt-Router-Configuration-File.md) to get the router decrypted configuration file `RSTXXXXXXX_JCXXXXX.txt`
2. Open `RSTXXXXXXX_JCXXXXX.txt` with Notepad or other Text Editor 
3. **Find** the line 
`config.vsftpd["ftpd"][1]["enable"] = "0"`
and **replace** it with
`config.vsftpd["ftpd"][1]["enable"] = "1"`
4. Follow [this guide](https://github.com/JFC-Group/JF-Customisation/blob/master/Instructions/Encrypt-Router-Configuration-File.md) to re-encrypt the configuration file and restore it via the router admin panel.
