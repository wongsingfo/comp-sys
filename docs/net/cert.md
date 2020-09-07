---
layout: default
title: Certificate
parent: Network Stack
nav_order: 10
---

# Certificate

References:

- 

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Attack

Threat Model:

| Attack       | Ability            | Threat                              |
| ------------ | ------------------ | ----------------------------------- |
| Eavesdropper | Intercept messages | Read contents of messages           |
| Intruder     | Compromised host   | Tamper with the contents            |
| Impersonator | Social engineering | Trick party into giving information |
| Extortionist | botnet             | Disrupt network services            |

- Ciphertext-only attack: have access only to the intercepted ciphertext 
- Known-plaintext attack: knows some of the (plaintext, ciphertext) pairings
- Chosen-plaintext attack: intruder is able to obtain its corresponding ciphertext form 

safety:

- confidentiality: eavesdrop
- integrity: alter attack, reordering attack
- authenticity: impersonate
- freshness (nonce): replay attack

## TLS

1.client sends:

- a list of cryptographic algorithms it supports
- a client nonce. 

2.server sends:

- a symmetric algorithm (for example, AES), 
- a public key algorithm (for example, RSA with a specific key length)
- a MAC algorithm
- a certificate
- a server nonce. 

3.client sends: 

- a **Pre-Master Secret (PMS)**, encrypted with public key
- **Master Secret (MS)**: session MAC/encryption key for data sent from sever to client / client to server.

4.The client sends a MAC of all the handshake messages. 

5.The server sends a MAC of all the handshake messages. 

4,5 protect the handshake from tampering (downgrade attacking) (attacker may choose a weaker cryptographic algorithm)

## Digital Certificate 

- Domain Validated Certificates (DV / DVC)
  - X.509
  - typically used for TLS
  - Proves some control over a DNS domain
  - ideal for use on websites like this site that provides content, and not used for sensitive data.
- Extended Validation Certificate (EV / EVC)
  - used for HTTPS websites 
  - proves the legal entity controlling the website or software package
  - requires verification of the requesting entity’s identity by a certificate authority (CA)

Type:

- fully qualified domain name (**FQDN**)
- **Wildcard certificate**: covers **all sub domains** under a particular domain name.
- **SAN (Subject Alternative Name)**: secures 4 additional domain names in addition to the main domain name

## RSA key

```bash
# generation
# #   If you want a non password protected key just remove the -des3 option
# #   -nodes: no password
openssl genrsa -des3 -out server.key 2048 

# remove passwd
openssl rsa -in server.key -out server_no_pwd.key
```

## X.509

RFC 5280

File encoding:

- `der`: used for binary DER encoded certificates. It can bear
  - `cer`
  - `crt`
- `pem`: Base64-encoded with prefix `-----BEGIN`

File categories:

- `crt`: used for certificates. It may be encoded as `der` or `pem`.
- `cer`: The CER and CRT extensions are nearly synonymous. `crt` is commonly used among \*nix systems while `cer` is a Microsoft conversion.
- `key`: used both for public and private `PKCS#8` keys. It may be encoded as `der` or `pem`.

------

```bash
# inspection
openssl x509 -in cert.crt -text              # for pem encoding
openssl x509 -in cert.der -inform der -text  # for der encoding
openssl x509 -in cert.crt -outform der -out cert.der
openssl x509 -in cert.crt -inform der -outform pem -out cert.pem

# create CA certificate
#   may be used with -config
#   -nodes: no password
openssl req -x509 -days 365 -newkey rsa:4096 -sha256 -nodes -out cacert.pem
# or
openssl req -x509 -days 365 -new -key server.key -out cacert.pem -outform PEM
```

### Signing Request

Typical information required:

a block of encoded text that is given to a Certificate Authority when applying for an SSL Certificate. 

| Distinguished Names (DN) | Information                           |      |
| ------------------------ | ------------------------------------- | ---- |
| CN                       | Common name                           | FQDN |
| O                        | Business name / Organization          |      |
| OU                       | Department Name / Organizational Unit |      |
| L                        | Town / City                           |      |
| ST                       | Province, Region, County or State     |      |
| C                        | Country                               |      |
| MAIL                     | Email address                         |      |

```bash
# inspection
openssl req -in server.csr -text

# creation
#   use -config to pass the information
openssl req -new -key server.key -out server.scr
openssl req -newkey rsa:4096 -sha256 -nodes -out server.scr
```

### Signing

```bash
# sign
#   https://stackoverflow.com/questions/21297139/how-do-you-sign-a-certificate-signing-request-with-your-certification-authority
openssl ca -config openssl-ca.cnf -policy signing_policy -extensions signing_req -out servercert.pem -infiles servercert.csr
# openssl-ca.cnf
[ CA_default ]
base_dir      = .
certificate   = $base_dir/cacert.pem   # The CA certifcate
private_key   = $base_dir/cakey.pem    # The CA private key
new_certs_dir = $base_dir              # Location for new certs after signing
database      = $base_dir/index.txt    # Database index file         (e.g. 01)
serial        = $base_dir/serial.txt   # The current serial number   (e.g. 01)
unique_subject = no  # Set to 'no' to allow creation of
                     # several certificates with same subject.

# self-sign
openssl x509 -req -day 365 -in server.scr -signkey server.key -out server.crt
```

### OCSP stapling

The Online Certificate Status Protocol (OCSP) stapling, formally known as the TLS Certificate Status Request extension, is a standard for checking the revocation status of X.509 digital certificates.

https://blog.cloudflare.com/high-reliability-ocsp-stapling/