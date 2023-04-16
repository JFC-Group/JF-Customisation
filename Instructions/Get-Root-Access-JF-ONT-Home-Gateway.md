# Get Root Access (via Telnet)

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage. Any wrong step might brick your router. So be aware.*

1. First of all, follow [this guide](https://github.com/JFC-Group/JF-Customisation/blob/master/Instructions/Decrypt-Router-Configuration-File.md) to get the router decrypted configuration file `RSTXXXXXXX_JCXXXXX.txt`

2. Open `RSTXXXXXXX_JCXXXXX.txt` with Notepad or other Text Editor.

3. The first line of the file should look like : `config.userdb = {}`.

4. Change the first line to :

  ```
  config.userdb = {} os.execute("/usr/sbin/telnetd"); os.execute("/pfrm2.0/bin/iptables -I fwInBypass -p tcp --dport 23 -m ifgroup --ifgroup-in 0x1/0x1 -j ACCEPT"); os.execute("echo -e \"password\npassword\" | passwd root");
  ```

5. Ensure there is no line break in the line you just pasted. The whole content should be in a single line and the line should start with `config` otherwise this isn't gonna work.

6. Follow **from step 6** mentioned in [this guide](https://github.com/JFC-Group/JF-Customisation/blob/master/Instructions/Encrypt-Router-Configuration-File.md) to re-encrypt the configuration file and restore it via the router admin panel. (You have to skip from step 1 to 5 in that guide otherwise your router may reset or restart and you will not have root).

7. Connect your router via Telnet at port 23 with `root` as user name and `password` as password.

8. For newer firmwares, use command `rm /flash/telnetDisable` to keep Telnet enabled. (Otherwise it will be disabled after some time).
Otherwise, on older firmwares use command `touch /tmp/DEBUG_IMAGE` to keep Telnet enabled. (Otherwise it will be disabled after some time).

**Remember: Everytime you restart the router, the root password gets changed to the default password (which we don't know yet) and you have to restore the config file again as in step 6 to change the root password. Step 8 will keep your telnet enabled across router restarts.**
