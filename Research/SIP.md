# JioFiber SIP Breakdown

**Disclaimer: - This is Only for educational purposes, No one is responsible for any type of damage.**

*This is what I know so far about the SIP framework used in JioFiber router and JioJoin app to make calls.*

## The Story

Back in 2020, before I came to know about the JioFiber firmware, the first thing I did was to sniff the network packets sent from the JioCall app to the router while registering and calling through the app for the first time. But when I turned on the sniffing app, JioCall was not detecting the router because the sniffing app was using VPN method and thus the local network was not accessible through it.

So I turned on my laptop, installed JioCall on an Android Emulator, turned on Wireshark, and then opened JioCall. Everything was working perfectly. But the requests which the app made to the router was encrypted by self-signed certificate, so I couldn't actually sniff the packets. But I got something useful : **The ports which the SIP Server listens on, which are 8080, 8443 and 7443**.

Next thing I did was to decompile the JioCall apk via [jadx](https://github.com/skylot/jadx) and I found a lot of interesting things. Looking into the code of JioCall app (which was obfuscated of course), I found that it was using [Retrofit](https://square.github.io/retrofit/) for the network requests which means that there must be an interface somewhere which contains all the HTTP links with their request methods and if POST request, then their POST data structures. So, I went through the code and found some interesting links. One of them was : `/request_account`. I opened up my browser and opened `http://192.168.29.1:8080/request_account` and voila, this is what I got as response (actually this is the current response, previously the response was a bit different but the contents were almost the same) :-

```json
{"imsi": "00000XXXXXXXXXX","msisdn": "XXXXXXXXXX","mcc": "405","mnc": "874","mode": "JFV","mac_address": "aa:bb:cc:dd:ee:ff","JTCAutoWhitelist": "true","SelfHelpONTLogs": "true","CentralizedCallBlocking": "true","CentralizedCallWaiting": "true"}
```

Indeed, the `msisdn` key contained my JioFiber landline number. I also tried the other URL paths but none of them worked, perhaps those need an API key to work. Atleast I know that I am heading to the right path.

After an year, in October 2021, I found [this repository](https://github.com/fawazahmed0/Jio-fiber-Modem) where I found JioFiber Firmware. I downloaded the firmware quickly and started to explore its contents. I read the lua codes and came to know how the WEB-UI works and stuff. I discovered the way to [get dbglogs from JioFiber](https://github.com/itsyourap/JioFiber-Home-Gateway/blob/master/Instructions/Get-dbglogs-JioFiber-ONT-Home-Gateway.md) and within November, I discovered the way to decrypt the router settings backup file using the Router keys.

Then I started looking for the VoIP server code (which is called the Juice Server) in the firmware which led me to `/pfrm2.0/etc/voipInit` which further led me to `pfrm2.0/bin/hgw-voice-app` which was, of course, a binary, that cannot be decompiled easily. So, I started dumping the strings present in the binary and I found a reference to `libims.so` library which was present in `/pfrm2.0/lib/`. Dumping the strings in the `libims.so` gave me exactly what I needed.

## Juice Server

The Juice server in JioFiber is responsible for handling all the SIP communications. JioJoin app uses its API to make calls using the JioFiber VoIP Landline number.

**Uses Ports :** 8080, 7443, 8443, 5068 (maybe more)

**Useful Links :**

1. `http://192.168.29.1:8080/pcap?start=1` will start recording all packets sent from/to the Juice Server until stopped.
2. `http://192.168.29.1:8080/pcap?stop=1` will stop recording packets.
3. `http://192.168.29.1:8080/logs` will let you download the captured packets in a pcap file along with the complete Juice Log dump (VERY USEFUL).
4. `http://192.168.29.1:8080/request_account` will give you a JSON consisting of your JioFiber Landline Number, MCC, MNC, etc etc.
5. `http://192.168.29.1:8080/request_mac` will give you a JSON with your router's MAC address in it.

There are many more, but the first three are the most important links.

## How JioJoin Works

1. First, after opening JioJoin for the first time, it will search for the host `jiofiber.local.html` with a DNS Query. If found, JioJoin will assume that you are on a JioFiber network. *(This is why using custom DNS providers stops JioJoin from working, to tackle this, you can define `jiofiber.local.html` with your router's static IP in your `hosts` file)*
2. After you click on the "Generate OTP" button, your phone sends an API request to the Juice Server in the router. The request is kinda like this :-

    ```none
    https://jiofiber.local.html:8443/?IMEI=&rcs_profile=joyn_blackbird&SMS_port=0&default_sms_app=1&msisdn=&rcs_state=0&vers=0&terminal_vendor=sams&terminal_model=aosp&provisioning_version=2.0&rcs_version=5.1B&device_type=vvm&act_type=volatile&terminal_sw_version=7.1.2&default_vvm_app=0&IMSI=&client_vendor=WITS&client_version=RCSAndrd-5.3&alias=itsyourap&mac_address=aa:bb:cc:dd:ee:ff&nwk_intf=wifi&op_type=add
    ```

    **The most important paramters here are `mac_address`, `nwk_intf` and `op_type`. Others can be ignored to get the same response from the request.**

    Let me explain the request and what it does.

    The `mac_address` parameter contains a random mac address (it is not a real mac address of any device in your network, it is a random mac generated like as a session key which persists with the current JioJoin installation. It might be the real mac address in case of Jio STB).

    The `nwk_intf` parameter represents the Network Interface used for the request, it can either be `wifi` (almost everytime) or `eth` (in case of requests from Jio STB).

    The `op_type` parameter perhaps represents "option type". It can be `add` or `remove` (maybe more which idk).

    The `mac_address` and `op_type` are essential parameters in this request.

    So, whenever this request is sent to the Juice Server, the Server first checks the `op_type` parameter. If it is `add` then the server has to add the device (from where the request was initiated) to SIP whitelist (devices in this list are the only devices which are permitted to send or receive SIP requests/responses). The server differentiates between clients (I mean different JioJoin apps on different devices) using the `mac_address` parameter which is unique for each JioJoin app installation. The Juice server checks if the `mac_address` is already present in the whitelisted devices list. If it is present it replies with a XML data which contains all the SIP configs which is explained later. For now let us assume that our device was not previously whitelisted. An OTP is sent to your JioFiber linked mobile number. The Juice server then responds with a **`200 OK`** status code but without any response data. But the server provides with some important response headers which are

    ```none
    Set-Cookie: WITRCSeConfigCookie=uuuuuuuu-vvvv-xxxx-yyyy-zzzzzzzzzzzz
    ```

    and

    ```none
    x-amn: +91********XX
    ```

    The Cookie called `WITRCSeConfigCookie` will be needed when we want to verify the OTP with the Juice Server next while the `x-amn` header signifies the JioFiber linked mobile number to which the OTP was sent.

3. JioJoin tells you that an OTP was sent to your registered mobile number `+91********XX` which is derived from the `x-amn` header from the previous step. You type the OTP and submit it. Now the request is sent to the Juice Server looks like this (assume the OTP is 696969):

    ```none
    https://jiofiber.local.html:8443/?OTP=696969
    ```

    with a required header :

    ```none
    Cookie: WITRCSeConfigCookie=uuuuuuuu-vvvv-xxxx-yyyy-zzzzzzzzzzzz
    ```

    which we have received from the `Set-Cookie` header from the server response in step 2.

4. As soon as the OTP is verified, the Juice Server whitelists the `mac_address` associated with the request with the cookie and replies with an XML body. This XML is the SIP configuration required to make calls using JioJoin. Now, as the `mac_address` is verified, you can use it to get the XML configuration anytime using step 2. The response in step 2 will now be the XML data without any further authentication.

    The XML Configuration looks like this :

    ```xml
    <?xml version="1.0"?>
   <wap-provisioningdoc version="1.1">
   <characteristic type="application">
   <characteristic type="appauth">
   <parm name="authtype" value="Digest" />
   <parm name="realm" value="wb.wln.ims.jio.com" />
   <parm name="username" value="91XXXXXXXXXX@wb.wln.ims.jio.com" />
   <parm name="userpwd" value="<randompassword>" />
   </characteristic>
   <parm name="appid" value="ap2002" />
   <characteristic type="capdiscovery">
   <parm name="capdisccommonstack" value="0" />
   <parm name="defaultdisc" value="0" />
   <characteristic type="ext">
   <characteristic type="joyn">
   <parm name="lastseenactive" value="0" />
   <parm name="msgcapvalidity" value="5" />
   </characteristic>
   </characteristic>
   <parm name="pollingperiod" value="0" />
   </characteristic>
   <characteristic type="ext">
   <parm name="inturlfmt" value="1" />
   <parm name="naturlfmt" value="1" />
   <parm name="q-value" value="0.5" />
   <characteristic type="secondarydevicepar">
   <parm name="chat" value="0" />
   <parm name="filetransfer" value="0" />
   <parm name="geolocpush" value="0" />
   <parm name="imageshare" value="0" />
   <parm name="sendsms" value="0" />
   <parm name="videocall" value="0" />
   <parm name="videoshare" value="0" />
   <parm name="voicecall" value="0" />
   </characteristic>
   </characteristic>
   <parm name="home_network_domain_name" value="wb.wln.ims.jio.com" />
   <characteristic type="icsi_list">
   <parm name="icsi_resource_allocation_mode" value="0" />
   </characteristic>
   <characteristic type="im">
   <parm name="autaccept" value="0" />
   <parm name="autacceptgroupchat" value="0" />
   <parm name="conf-fcty-uri" value="sip:foo@bar" />
   <parm name="deferred-msg-func-uri" value="sip:foo@bar" />
   <parm name="exploder-uri" value="sip:foo@bar" />
   <parm name="firstmessageinvite" value="1" />
   <parm name="ftautaccept" value="0" />
   <parm name="ftcapalwayson" value="0" />
   <parm name="ftstandfwenabled" value="0" />
   <parm name="ftthumb" value="0" />
   <parm name="groupchatfullstandfwd" value="0" />
   <parm name="groupchatonlyfstandfwd" value="0" />
   <parm name="imcapalwayson" value="0" />
   <parm name="imcapnonrcs" value="0" />
   <parm name="imwarniw" value="0" />
   <parm name="imwarnsf" value="0" />
   <parm name="multimediachat" value="0" />
   <parm name="pres-srv-cap" value="0" />
   <parm name="smsfallbackauth" value="0" />
   <parm name="timeridle" value="180" />
   </characteristic>
   <characteristic type="ims">
   <parm name="to-appref" value="IMS-Settings" />
   </characteristic>
   <parm name="keep_alive_enabled" value="1" />
   <characteristic type="lbo_p-cscf_address">
   <parm name="address" value="Jiofiber.local.html:5068" />
   <parm name="addresstype" value="IPv6" />
   </characteristic>
   <parm name="mobility_management_ims_voice_termination" value="0" />
   <characteristic type="other">
   <parm name="deviceid" value="1" />
   <parm name="ipcallbreakout" value="0" />
   <parm name="ipcallbreakoutcs" value="0" />
   <parm name="rcsipvideocallupgradeattemptearly" value="0" />
   <parm name="rcsipvideocallupgradefromcs" value="0" />
   <parm name="rcsipvideocallupgradeoncaperror" value="0" />
   <characteristic type="transportproto">
   <parm name="psmedia" value="MSRP" />
   <parm name="psrtmedia" value="RTP" />
   <parm name="pssignalling" value="SIPoTLS" />
   <parm name="wifimedia" value="MSRP" />
   <parm name="wifirtmedia" value="RTP" />
   <parm name="wifisignalling" value="SIPoTLS" />
   </characteristic>
   <parm name="uuid_value" value="00000000-0000-1000-8000-AABBCCDDEEFF" />
   </characteristic>
   <parm name="pdp_contextoperpref" value="0" />
   <parm name="private_user_identity" value="sip:91XXXXXXXXXX@wb.wln.ims.jio.com" />
   <characteristic type="public_user_identity_list">
   <parm name="public_user_identity" value="sip:+91XXXXXXXXXX@wb.wln.ims.jio.com" />
   </characteristic>
   <parm name="regretrybasetime" value="5" />
   <parm name="regretrymaxtime" value="300" />
   <characteristic type="serviceproviderext">
   <parm name="ipvideocallbreakout" value="1" />
   <characteristic type="joyn">
   <characteristic type="messaging">
   <parm name="deliverytimeout" value="300" />
   <parm name="fthttpcapalwayson" value="0" />
   </characteristic>
   <characteristic type="ux">
   <parm name="breakoutipcalllabel" value="joyn out" />
   <parm name="e2eipcalllabel" value="joyn out" />
   <parm name="e2evoicecapabilityhandling" value="0" />
   <parm name="messagingux" value="0" />
   <parm name="onebuttonvideocall" value="0" />
   </characteristic>
   </characteristic>
   <characteristic type="remoteconferencecall">
   <parm name="addparticipantmodes" value="2" />
   <parm name="createinvincludeparticipants" value="0" />
   <parm name="createmodes" value="2" />
   <parm name="factory" value="sip:mmtel@conf-factory.wb.wln.ims.jio.com" />
   <parm name="maxsize" value="8" />
   </characteristic>
   <characteristic type="rjil">
   <parm name="pnparam" value="com.jio.jiocall" />
   <parm name="psoltid" value="+91XXXX" />
   </characteristic>
   <characteristic type="wae">
   <parm name="allowoffline" value="0" />
   <parm name="pwd" value="wit$waereport" />
   <parm name="url" value="https://103.63.128.133/events" />
   <parm name="user" value="witapp" />
   <parm name="format" value="json" />
   </characteristic>
   </characteristic>
   <characteristic type="services">
   <parm name="allowrcsextensions" value="0" />
   <parm name="chatauth" value="0" />
   <parm name="ftauth" value="0" />
   <parm name="geolocpullauth" value="0" />
   <parm name="geolocpushauth" value="0" />
   <parm name="groupchatauth" value="0" />
   <parm name="isauth" value="0" />
   <parm name="presenceprfl" value="0" />
   <parm name="rcsipvideocallauth" value="15" />
   <parm name="rcsipvoicecallauth" value="15" />
   <parm name="standalonemsgauth" value="0" />
   <parm name="vsauth" value="0" />
   </characteristic>
   <parm name="sms_over_ip_networks_indication" value="1" />
   <characteristic type="supl">
   <parm name="geolocpullopen" value="0" />
   <parm name="textmaxlength" value="200" />
   </characteristic>
   <parm name="timer_t1" value="2000" />
   <parm name="timer_t2" value="16000" />
   <parm name="timer_t4" value="17000" />
   <parm name="voice_domain_preference_e_utran" value="2" />
   <parm name="voice_domain_preference_utran" value="2" />
   <characteristic type="xdms">
   <parm name="enablepnbmanagement" value="0" />
   <parm name="enablexdmsubscribe" value="0" />
   <parm name="revoketimer" value="0" />
   </characteristic>
   </characteristic>
   <characteristic type="token">
   <parm name="token" value="<Some Token>" />
   <parm name="validity" value="7776000" />
   </characteristic>
   <characteristic type="vers">
   <parm name="validity" value="5184000" />
   <parm name="version" value="34" />
   </characteristic>
   </wap-provisioningdoc>
    ```

    **We need mainly these parameters :**

    1. Under `characteristic` of type `application.appauth` :

        `authtype` - Digest Authentication

        `realm` - SIP Server Realm (for Jio, you cannot connect directly to it, so you need to have the Juice Server as Proxy),

        `username` - SIP Username for authentication,

        `userpwd` - SIP Password for authentication

    2. Under `characteristic` of type `application.lbo_p-cscf_address`:

        `address` - Refers to the SIP Proxy URL which is basically the port 5068 of JioFiber

    3. Under `characteristic` of type `application.other`:

        `uuid_value` represents the value of `mac_address` parameter, if your `mac_address` parameter was `aa:bb:cc:dd:ee:ff` then the last section of the uuid will be `AABBCCDDEEFF`. The first sections are same for every device under every router as far as I know.

## How SIP (in JioJoin and JioFiber) Works

*You can see the pcap yourself if you use the previously provided important links in the [Juice Server section](#juice-server).*

### REGISTER Request

The REGISTER request sent by the SIP client (here, JioJoin app) looks like this:

```none
REGISTER sip:wb.wln.ims.jio.com SIP/2.0
Via: SIP/2.0/TLS [<My IPv6 Address>]:42131;branch=z9hG4bK-642413-1---7f3f2b4d23eea124;rkeep=180
Max-Forwards: 70
Contact: <sip:+91XXXXXXXXXX@[<My IPv6 Address>]:42131;pn-prid=<FCM Token provided from JioJoin (This parameter is not required)>;pn-param=com.jio.jse;pn-provider=fcm;transport=tls>;+sip.instance="<00000000-0000-1000-8000-AABBCCDDEEFF>";reg-id=1;+g.3gpp.icsi-ref="urn%3Aurn-7%3A3gpp-service.ims.icsi.mmtel";video;+g.3gpp.iari-ref="urn%3Aurn-7%3A3gpp-application.ims.iari.rcs.jio.eucr";+g.gsma.rcs.telephony="none";q=0.5
To: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>
From: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=j6ska8a
Call-ID: _idu1H_8kdsjK9sja..
CSeq: 1 REGISTER
Expires: 86400
Allow: INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, SUBSCRIBE, UPDATE, PRACK, INFO
Supported: outbound, path, gruu, replaces, timer, norefersub
User-Agent: itsyourap/android RCSAndrd/1.2.4 JUICEJSE/1.4.2.11
Authorization: Digest username="91XXXXXXXXXX@wb.wln.ims.jio.com",realm="wb.wln.ims.jio.com",uri="sip:wb.wln.ims.jio.com",nonce="",response=""
P-Access-Network-Info: GPON;PSAPId=+91XXXX
Content-Length: 0
```

This is the general format of every request sent to the SIP server. This request is sent via the proxy, i.e., Juice Server (look for the parameters in the XML file mentioned previously).

Things that makes Jio's SIP protocol different from others are:

1. **The Contact Header** - The contact header must have the `+sip.instance` parameter with proper value format otherwise you will get *401 Unauthorized* response from the server. The proper format of this parameter is `+sip.instance="<00000000-0000-1000-8000-AABBCCDDEEFF>"` where you have to put the value of uuid got from the XML previously.

    Let me be clear, other SIP Server/Clients have their `+sip.instance` parameter format as `+sip.instance="<urn:uuid:ABCABCAB-AABB-CCDD-EEFF-AABBCCAABBCCC>"` - Note the string `urn:uuid:` is present which Jio's Juice Server does not support. (This is why using a third party SIP client like MicroSIP to call through JioFiber isn't gonna work).

2. **The P-Access-Network-Info Header** - Use it on every request.

So, the first time you send the REGISTER request to the SIP server via the Juice Server as proxy, you will get a *401 Unauthorized* response because you haven't provided your credentials yet. The server response is important. Let me show you how it looks like :

```none
SIP/2.0 401 Unauthorized
Via: SIP/2.0/TLS [<My IPv6 Address>]:42131;branch=z9hG4bK-642413-1---7f3f2b4d23eea124;rkeep=180
To: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=h9sj9ca
From: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=j6ska8a
Call-ID: _idu1H_8kdsjK9sja..
CSeq: 1 REGISTER
User-Agent: JCOW414/JUICEJFV-1.3.24
WWW-Authenticate: Digest nonce="1327324632:a53f5324f3442323cb3242321435b43dca3",algorithm=MD5,realm="wb.wln.ims.jio.com"
Content-Length: 0    
```

The headers `WWW-Authenticate` contains the Digest nonce which will be used to verify your identity using your credentials. Refer to [Wikipedia](https://en.wikipedia.org/wiki/Digest_access_authentication) for more information about digest authentication.

According to [Wikipedia](https://en.wikipedia.org/wiki/Digest_access_authentication), we need to prepare a response based on the nonce and our credentials.
The format is:

```none
HA1 = MD5(username:realm:password)
HA2 = MD5(method:digestURI)
response = MD5(HA1:nonce:HA2)
```

where

`username` refers to your SIP username found in the XML, here, `91XXXXXXXXXX@wb.wln.ims.jio.com`

`realm` refers to your SIP realm, here, `wb.wln.ims.jio.com`

`password` refers to your SIP password, here `<randompassword>`

`method` refers to the request method, here, `REGISTER`

`digestURI` refers to (idk what) but it is `"sip:" + realm`, here, `sip:wb.wln.ims.jio.com`

`MD5(x)` refers to the MD5 hash of `x`.

After preparing our response, we need to send another REGISTER request with a fulfilled `Authorization` header like this:

```none
REGISTER sip:wb.wln.ims.jio.com SIP/2.0
Via: SIP/2.0/TLS [<My IPv6 Address>]:42131;branch=z9hG4bK-642413-1---7f3f2b4d23eea124;rkeep=180
Max-Forwards: 70
Contact: <sip:+91XXXXXXXXXX@[<My IPv6 Address>]:42131;pn-prid=<FCM Token provided from JioJoin (This parameter is not required)>;pn-param=com.jio.jse;pn-provider=fcm;transport=tls>;+sip.instance="<00000000-0000-1000-8000-AABBCCDDEEFF>";reg-id=1;+g.3gpp.icsi-ref="urn%3Aurn-7%3A3gpp-service.ims.icsi.mmtel";video;+g.3gpp.iari-ref="urn%3Aurn-7%3A3gpp-application.ims.iari.rcs.jio.eucr";+g.gsma.rcs.telephony="none";q=0.5
To: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>
From: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=j6ska8a
Call-ID: _idu1H_8kdsjK9sja..
CSeq: 2 REGISTER
Expires: 86400
Allow: INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, SUBSCRIBE, UPDATE, PRACK, INFO
Supported: outbound, path, gruu, replaces, timer, norefersub
User-Agent: itsyourap/android RCSAndrd/1.2.4 JUICEJSE/1.4.2.11
Authorization: Digest username="91XXXXXXXXXX@wb.wln.ims.jio.com",realm="wb.wln.ims.jio.com",nonce="1327324632:a53f5324f3442323cb3242321435b43dca3",uri="sip:wb.wln.ims.jio.com",response="<Your Auth Response>",algorithm=MD5
P-Access-Network-Info: GPON;PSAPId=+91XXXX
Content-Length: 0
```

Now we get a *200 OK* from the server:

```none
SIP/2.0 200 OK
Via: SIP/2.0/TLS [<My IPv6 Address>]:42131;branch=z9hG4bK-642413-1---7f3f2b4d23eea124;rkeep=180
Require: outbound
Contact: <sip:+91XXXXXXXXXX@[<My IPv6 Address>]:42131;pn-prid=<FCM Token provided from JioJoin (This parameter is not required)>;pn-param=com.jio.jse;pn-provider=fcm;transport=tls>;+sip.instance="<00000000-0000-1000-8000-AABBCCDDEEFF>";reg-id=1;video;q=0.5;expires=86399;+g.3gpp.icsi-ref="urn%3Aurn-7%3A3gpp-service.ims.icsi.mmtel";+g.3gpp.iari-ref="urn%3Aurn-7%3A3gpp-application.ims.iari.rcs.jio.eucr";+g.gsma.rcs.telephony="none"
To: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=32ad2f2c
From: <sip:+91XXXXXXXXXX@wb.wln.ims.jio.com>;tag=j6ska8a
Call-ID: _idu1H_8kdsjK9sja..
CSeq: 2 REGISTER
User-Agent: JCOW414/JUICEJFV-1.3.24
Content-Length: 0
```

Thus the REGISTER request is successful.

To call someone, you need to send an INVITE request with SDP data like this:

```none
INVITE sip:<Recipent Mobile Number starting with 0>@wb.wln.ims.jio.com?phone-context=wb.wln.ims.jio.com&user=phone SIP/2.0
Via: SIP/2.0/TLS [<My IPv6 Address>]:43696;rkeep=180;branch=z9hG4bK-<Branch>
Max-Forwards: 70
Contact: <sip:[<My IPv6 Address>]:43696;transport=tls>;+sip.instance="<00000000-0000-1000-8000-AABBCCDDEEFF>";reg-id=1;+g.3gpp.icsi-ref="urn:urn-7:3gpp-service.ims.icsi.mmtel";video;+g.3gpp.iari-ref="urn:urn-7:3gpp-application.ims.iari.rcs.jio.eucr";+g.gsma.rcs.telephony="none";q=0.5
To: <sip:<Recipent Mobile Number starting with 0>@wb.wln.ims.jio.com?phone-context=wb.wln.ims.jio.com&user=phone>
From: <sip:+91<My JioFiber Number>@wb.wln.ims.jio.com>;tag=4cwftvh2
Call-ID: <callid>@<My IPv6 Address>
CSeq: 1 INVITE
Session-Expires: 1800
Min-SE: 90
Allow: INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, SUBSCRIBE, UPDATE, PRACK, INFO
Content-Type: application/sdp
Supported: outbound, path, gruu, replaces, timer, norefersub, 100rel
User-Agent: JioFiberVoice/1.0
P-Preferred-Identity: <sip:+91<My JioFiber Number>@wb.wln.ims.jio.com>
P-Access-Network-Info: GPON; PSAPId=+91XXXX
Content-Length: 675

v=0
o=Juice 1737281838294729 1737281838294729 IN IP6 <An IPv6 Address>
s=-
c=IN IP6 <An IPv6 Address>
t=0 0
m=audio 52000 RTP/AVP 126 125 124 123 122 121
b=AS:37
b=RS:462
b=RR:1387
a=rtpmap:126 AMR-WB/16000
a=fmtp:126 mode-change-capability=2; max-red=0
a=rtpmap:125 AMR-WB/16000
a=fmtp:125 octet-align=1; mode-change-capability=2; max-red=0
a=rtpmap:124 AMR/8000
a=fmtp:124 mode-change-capability=2; max-red=0
a=rtpmap:123 AMR/8000
a=fmtp:123 octet-align=1; mode-change-capability=2; max-red=0
a=rtpmap:122 telephone-event/16000
a=fmtp:122 0-15
a=rtpmap:121 telephone-event/8000
a=fmtp:121 0-15
a=ptime:20
a=maxptime:240
a=sendrecv
```

The Juice server responds with *100 Trying* which means the call is being connected.

When the recipient picks up the call, we get a *183 Session Progress* from the Juice server along with some SDP data. It does place a call to the number but of course with no audio.

Also you need to send ACK and PRACK requests frequently to keep the call alive. You can read any SIP documentations available on the internet for more info.

Right now, I am stuck at using the RTP. In the INVITE request you can see the request data which is SDP. The `m` parameter gives us the media info which is `RTP/AVP` on port `52000`. Yes you can use any program to create RTP server on that port but the the actual RTP server will be created on the JioFiber side for further communication.The only problem is the audio codec. The audio codec used is `AMR/AMR-WB` which from Android. I don't have the time to look at the whole source code of the audio codec in android repository. You can help me out with this.

I have tried connecting to the RTP server in the Juice Server and I got the audio data but it was AMR-WB encoded. I tried to use some third party programs to get audible audio from the data and one seems to work : [Check this Python Program](https://github.com/Spinlogic/AMR-WB_extractor). This gives me what I need but right now idk how to play the audio in realtime and how to reverse this process so that I can send audio data for the call.

If you do find a way to play the AMR/AMR-WB encoded audio in realtime and record AMR/AMR-WB audio in realtime and use the RTP server to establish communication between the caller and the callee, feel free to open a discussion in this repository.

Until then, this is the dead end.