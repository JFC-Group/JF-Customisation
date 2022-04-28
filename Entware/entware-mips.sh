
echo "Mounting Devices"
mkdir /flash2/entware
mount /dev/sda1 /flash2/entware
cd /flash2/entware
echo ""
echo "Downloading Busybox from bin.entware.net"
mkdir /flash2/entware/bin
wget -O /flash2/entware/bin/busybox http://bin.entware.net/armv7sf-k3.2/installer/chroot/other/mipsel/busybox --no-check-certificate
chmod a+x /flash2/entware/bin/busybox
CHROOT_DIR=/flash2/entware
echo ""
echo "Running Chroot install Script"
# Mount VFS
for dir in dev dev/pts proc sys; do
    mkdir -p $CHROOT_DIR/$dir
    mount -o bind /$dir $CHROOT_DIR/$dir
    sleep 1
done

#Install Busybox
PATH=/bin:/sbin ./bin/busybox chroot . /bin/busybox --install -s

# Make resolv.conf and hosts
mkdir -p $CHROOT_DIR/etc
echo 'nameserver 8.8.8.8' > $CHROOT_DIR/etc/resolv.conf
echo 'nameserver 8.8.4.4' >> $CHROOT_DIR/etc/resolv.conf
echo '127.0.0.1  localhost' > $CHROOT_DIR/etc/hosts


echo "Done! Chroot in with"
echo "PATH=/bin:/sbin $CHROOT_DIR/bin/busybox chroot $CHROOT_DIR /bin/sh"
echo "Run wget http://bin.entware.net/mipselsf-k3.4/installer/generic.sh; mkdir /opt; chmod a+x generic.sh; sh generic.sh and you will be done."
