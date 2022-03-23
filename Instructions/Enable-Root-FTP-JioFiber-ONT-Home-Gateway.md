
# Enable FTP Server with `/` as FTP Root

*Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage. Any wrong step might brick your router. So be aware.*  

1. First of all, follow [this guide](https://github.com/itsyourap/JioFiber-Home-Gateway/blob/master/Instructions/Get-Root-Access-JioFiber-ONT-Home-Gateway.md) to enable root access to your router.

2. Use command `pkill vsftpd` to kill any already running FTP server on your router.

3. Using `vi`, edit `/etc/vsftpd.conf` and remove all the lines and add these lines:

    ```
    anonymous_enable=NO
    local_enable=YES
    write_enable=YES
    dirmessage_enable=YES
    xferlog_enable=YES
    connect_from_port_20=YES
    listen_port=21
    idle_session_timeout=300
    max_clients=200
    max_per_ip=200
    chroot_local_user=YES
    ftp_username=root
    secure_chroot_dir=/
    local_root=/
    listen_ipv6=YES
    userlist_enable=no
    userlist_deny=NO
    ```

4. Save the file.

5. Use command `vsftpd /etc/vsftpd.conf &` to start the FTP server.

6. Use command `iptables -I fwInBypass -p tcp --dport 21 -m ifgroup --ifgroup-in 0x1/0x1 -j ACCEPT` to enable listening to port 21.

7. Connect your router using FTP client like FileZilla using `root` as username and your root password as the password.