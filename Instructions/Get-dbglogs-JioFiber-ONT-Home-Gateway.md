# Get Logs

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

**NOTE:  FTP username will be admin & password will be your admin password in WEB-UI (Router Configuration Page)**

1. Make sure you have [**openssl**](https://wiki.openssl.org/index.php/Binaries) **installed** or else install it and **add it to environment variable PATH**.
2. **Download** and **Extract** the **zip** of your respective firmware from [here](https://github.com/itsyourap/JioFiber-Home-Gateway/tree/master/Firmwares/)
3. Get **`server.key`** file from the Extracted zip at **`/pfrm2.0/etc/server.key`** and Copy it to **`Desktop/JioFiber`**.
4. Go to Your **Router WEB-UI Page** (`http://192.168.29.1`) and Sign in as **Admin**. (The default credentials are **admin : Jiocentrum**)
5. After you have signed in, change the URL in the address bar from `http://192.168.29.1/platform.cgi` to `http://192.168.29.1/dbglog.cgi`
6. Press Enter and wait a few minutes until a file gets downloaded. 
7. Save the downloaded file (**`reliance-dbglog-enc.tgz`**) to **`Desktop/JioFiber`**
8. Open up **Terminal** or **Command Prompt** in **`Desktop/JioFiber`**
9. **Decrypt** the downloaded **.enc** file using the command 
`openssl aes-128-cbc -d -kfile "server.key" -in "reliance-dbglog-enc.tgz" -out "reliance-dbglog-dec.tgz"`
10. **Extract** the `reliance-dbglog-dec.tgz` file using **7zip** or use the command `tar -xvf reliance-dbglog-dec.tgz`
11. You will see a lot of files have been extracted to the directory **`Desktop/JioFiber`**. These are the dbglogs.
12. Use [DB Browser for SQLite](https://sqlitebrowser.org/) to open the files with **`.db`** extension. 
13. Now experiment with those files on your own.

### The system.db file contains all the configuration data including Wi-Fi passwords, TR-069 Configuration, Router WEB-UI Passwords, and a lot more....
