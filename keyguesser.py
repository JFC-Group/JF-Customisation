#!/usr/bin/env python

# This is only for educational purposes. No one is responsible for any type of damage.

__author__ = "itsyourap" 
__url__ = "https://github.com/JFC-Group/JF-Customisation"

"""
This script tries to guess and identify the encryption key used to encrypt 
the JioFiber config file downloaded from the router's admin page

Works for newer firmwares like R2.49 for JCOW414

Modify this script variables accordingly before using this script

Remember to run this script from the same directory where your downloaded
encrypted config file is stored

Usage: keyguesser.py
"""

from itertools import permutations
import subprocess

#############################################################################################################
# Modify these variables accordingly before using this script                                               #
#############################################################################################################
inFileName = "RSXXXXXXXXXXX_JCOW414.enc" # Full name of the encrypted config backup file                    #
outFileName = "RSXXXXXXXXXXX_JCOW414.txt" # Name of output file if the decryption is successful             #
routerSerial = "RSXXXXXXXXXXX" # Your Router's Serial Number                                                #
routerSsid = "XXXXX"  # Default Router SSID without the 'JioFiber-' prefix                                  #
#############################################################################################################

#############################################################################################################
# All of the above information might be found written on the back of the router box.                        #
# The router SSID does NOT mean the current SSID of your router                                             #
# The router SSID is the DEFAULT SSID of your router, e.g., "JioFiber-Alpha"                                #
# You have to just take the "Alpha" part in the above routerSsid variable                                   #
#############################################################################################################

def tryToDecrypt(hexKey):
    p = subprocess.Popen(["openssl", "aes-128-cbc", "-d", "-pass", "pass:{}".format(hexKey),
                         "-in", inFileName, "-out", outFileName], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    output, error = p.communicate()
    output = output.decode()
    returnCode = p.returncode
    if (returnCode == 0):
        print("Success : {}".format(hexKey))
        exit()
    else:
        print("Failed!")
        print()


def tryKey(key):
    p = subprocess.Popen(["openssl", 'enc', "-aes-128-cbc", "-k", key,
                         "-P", "-nosalt"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    output, error = p.communicate()
    output = output.decode()
    startIndex = output.find("key=") + len("key=")
    endIndex = output.find("\n", startIndex)
    hexKey = output[startIndex:endIndex]
    print("Trying Key : {}".format(key))
    tryToDecrypt(hexKey)


keyStrings = ["1n0NaZQnC9oxcfwf", "us4AQiJAgbj0Fmxq", "NTqK8Ps5iFke8zrp", "bfqerloC15y79WQZ",
              "9gNzEbuDjtyT9Pyc", "uuphsZuO92AZW5GJ", "qdySWmmvYKdBcO53", "Q7ODauKsxUAUtbR7",
              "Kohgiem4joochei3"]

def useCombination(keyIndex):
    x = [routerSerial, keyStrings[keyIndex], routerSsid]

    perms = []

    for i in range(1, len(x)+1):
        for c in permutations(x, i):
            perms.append("".join(c))

    for i in range(0, len(perms)):
        raw = perms[i]
        tryKey(raw)
        

if (__name__ == "__main__"):
    for i in range(0, len(keyStrings)):
        useCombination(i)
