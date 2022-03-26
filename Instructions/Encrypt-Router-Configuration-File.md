# Encrypt Configuration File

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.*

**(If you are attempting to get root or change the root password, you need to skip steps 1 to 5).**

1. Copy everything in the text configuration file (`RSTXXXXXXX_JCXXXXX.txt`) till before `config.checksum = "<some random md5 hash>"`.
2. Go to this [MD5 Hash Generator Website](https://passwordsgenerator.net/md5-hash-generator/) and paste it and leave a new line at the end. It should look like ![this](https://i.imgur.com/mAle1mi.png) 
3. Click on Generate to get the MD5 hash. Copy it.
4. In your text configuration file (`RSTXXXXXXX_JCXXXXX.txt`) change `config.checksum = "<some random md5 hash>"` to `config.checksum = "<THE MD5 HASH YOU COPIED IN STEP 3>"`.
5. Save the file.
6. Open Terminal or Command Prompt.
7. Use this command to re-encrypt the text configuration file with your respective `server.key` :- 
`openssl aes-128-cbc -kfile "<path to the key file>" -in "RSTXXXXXXX_JCXXXXX.txt" -out "RSTXXXXXXX_JCXXXXX_MODIFIED.enc"`
8. In your Router WEB-UI Page (`http://192.168.29.1`), go to `Administrator --> Maintenance`.
9. Select and restore the `RSTXXXXXXX_JCXXXXX_MODIFIED.enc` file that was generated at step 7.
10. If by any chance your router configuration file had incorrect settings, it might reset the whole configuration or also might brick the router. If your router is bricked, a hard reset might fix it. Just push the button (inside a hole) behind the router for about 30 seconds. And after it boots up, restore the original configuration file that you downloaded directly from the Router WEB-UI to get back your original settings.
