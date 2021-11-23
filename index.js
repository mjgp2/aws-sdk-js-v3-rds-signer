const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { HttpRequest } = require('@aws-sdk/protocol-http');
const { SignatureV4 } = require('@aws-sdk/signature-v4');
const { Hash } = require('@aws-sdk/hash-node');
const { formatUrl } = require('@aws-sdk/util-format-url');

const signing = {
  service: 'rds-db',
  protocol: 'https'
}

class Signer {
  constructor ({ credentials, hostname, port, region, username } = {}) {
    this.credentials = credentials || defaultProvider()
    this.hostname = hostname
    this.port = port
    this.region = region
    this.username = username
  }

  async getAuthToken ({
    hostname = this.hostname,
    port = this.port,
    username = this.username,
    region = this.region,
    credentials = this.credentials
  } = {}) {
    const signer = new SignatureV4({
      service: 'rds-db',
      region,
      credentials,
      sha256: Hash.bind(null, 'sha256')
    })

    const request = new HttpRequest({
      method: 'GET',
      protocol: signing.protocol,
      hostname,
      port,
      query: {
        Action: 'connect',
        DBUser: username
      },
      headers: {
        host: `${hostname}:${port}`
      }
    })

    const presigned = await signer.presign(request, {
      expiresIn: 900
    })

    return formatUrl(presigned).replace(`${presigned.protocol}//`, '')
  }
}

module.exports = { Signer };
