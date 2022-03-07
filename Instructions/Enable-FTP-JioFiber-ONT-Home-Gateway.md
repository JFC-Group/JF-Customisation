# Enable FTP (Does Not Work after R2.35 Update)

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

**NOTE:  FTP username will be admin & password will be your admin password in WEB-UI (Router Configuration Page)**

1. Make sure you have [**openssl**](https://wiki.openssl.org/index.php/Binaries) **installed** or else install it and **add it to environment variable PATH**.
2. **Download** and **Extract** the **zip** of your respective firmware from [here](https://github.com/itsyourap/JioFiber-Home-Gateway/tree/master/Firmwares/)
3. Get **`server.key`** file from the Extracted zip at **`/pfrm2.0/etc/server.key`** and Copy it to **`Desktop/JioFiber`**.
4. Go to Your **Router WEB-UI Page** (`http://192.168.29.1`) and Sign in as **Admin**. (The default credentials are **`admin : Jiocentrum`**)
5. Go to **Administrator** --> **Maintenance** and click **Backup**.
6. A file (`RSTXXXXXXX_JCXXXXX.enc`) will be downloaded with **`.enc`** extension. Save it in **`Desktop/JioFiber`**.
7. Open up **Terminal** or **Command Prompt** in **`Desktop/JioFiber`**
8. **Decrypt** the downloaded **`.enc`** file using the command 
`openssl aes-128-cbc -d -kfile "server.key" -in "RSTXXXXXXX_JCXXXXX.enc" -out "RSTXXXXXXX_JCXXXXX.txt"`
9. Open `RSTXXXXXXX_JCXXXXX.txt` with Notepad or other Text Editor 
10. **Find** the line 
`config.vsftpd["ftpd"][1]["enable"] = "0"`
and **replace** it with
`config.vsftpd["ftpd"][1]["enable"] = "1"`
11. **Find** the line
`config.checksum = "<SOME_RANDOM_MD5_HASH>"`
and **replace** it with
`config.checksum = "0"`
12. **Save** the file.
13. **ReEncrypt** the file to **`.enc`** using this command :-
`openssl aes-128-cbc -e -kfile "server.key" -in "RSTXXXXXXX_JCXXXXX.txt" -out "RSTXXXXXXX_JCXXXXX_MOD.enc"`
14. Open the **Router Configuration WEB-UI** (`http://192.168.29.1`).
15. Go to **Administrator** --> **Maintenance** and click **Choose File** and choose the file created at step 15 `RSTXXXXXXX_JCXXXXX_MOD.enc` in **`Desktop/JioFiber`**.
16. Click **Restore**. The router will reboot with the new configuration.
17. After the reboot is complete, you will find that FTP is enabled.
18. Plug-in a USB storage device to router.
19. Go to `ftp://192.168.29.1` with **Windows Explorer** or other **FTP client** and type in your **WEB-UI Credentials**.
20. Celebrate.
