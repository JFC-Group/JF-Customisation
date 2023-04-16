# Decrypt Configuration File (Does not work anymore)

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

1. Make sure you have [**openssl**](https://wiki.openssl.org/index.php/Binaries)  **installed** or else install it and **add it to environment variable PATH**.
2. Grab the key for your router model from [here](https://github.com/JFC-Group/JF-Customisation/tree/master/EncryptionKeys/).
3. Go to Your **Router WEB-UI Page** (`http://192.168.29.1`) and Sign in as **Admin**. (The default credentials are **`admin : Jiocentrum`**)
4. Go to **Administrator** --> **Maintenance** and click **Backup**.
5. A file (`RSTXXXXXXX_JCXXXXX.enc`) will be downloaded with **`.enc`** extension.
6. Open up **Terminal** or **Command Prompt**.
7. **Decrypt** the downloaded **`.enc`** file using the command
`openssl aes-128-cbc -d -kfile "<path to the key file>" -in "RSTXXXXXXX_JCXXXXX.enc" -out "RSTXXXXXXX_JCXXXXX.txt"`
8. `RSTXXXXXXX_JCXXXXX.txt` contains the decrypted configuration. You might view or edit it at your own risk as your router may get bricked due to incorrect configuration (A hard reset might fix it. Just push the button (inside a hole) behind the router for about 30 seconds)
9. You may also want to encrypt the configuration file after editing it and restore it. Instructions to do so are [here](https://github.com/JFC-Group/JF-Customisation/blob/master/Instructions/Encrypt-Router-Configuration-File.md).
