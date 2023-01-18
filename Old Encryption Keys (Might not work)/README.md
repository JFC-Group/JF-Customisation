# Usage

- Requires [OpenSSL](https://www.openssl.org/)

### Encrypt Files

`openssl aes-128-cbc -kfile "<key file>" -in "<input file>" -out "<output file>"`

### Decrypt Files

`openssl aes-128-cbc -d -kfile "<key file>" -in "<input file>" -out "<output file>"`