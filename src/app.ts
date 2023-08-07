import console from 'console'
import { issuer } from './issuer'
import {
  DidDocumentBuilder,
  HandshakeProtocol,
  KeyType,
  OutOfBandState,
  TypedArrayEncoder,
  getEd25519VerificationKey2018,
} from '@aries-framework/core'
import { connect } from 'ngrok'
import * as QRCode from 'qrcode'
import { server } from './server'

async function app() {
  await issuer.initialize()
  issuer.config.logger.info('Agents initialized!')

  const ngrokUrl = await connect(6006)
  issuer.config.endpoints = [ngrokUrl + '/didcomm']

  const domain = 'sairanjitaw.github.io'
  const did = `did:web:${domain}`
  const keyId = `${did}#key-1`

  const key = await issuer.wallet.createKey({
    keyType: KeyType.Ed25519,
    privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  })

  const didDocument = new DidDocumentBuilder(did)
    .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
    .addVerificationMethod(getEd25519VerificationKey2018({ key, id: keyId, controller: did }))
    .addAuthentication(keyId)
    .build()

  await issuer.dids.import({
    did,
    overwrite: true,
    didDocument,
  })

  // const issuerId = `did:web:sairanjitaw.github.io`
  // const privateKey = '73f80dcde8be30e538ea8bafeb4701d098c5ea72720a51dc750527f4b78f01b2'
  // await issuer.dids.import({
  //   did: issuerId,
  //   overwrite: true,
  //   privateKeys: [
  //     {
  //       keyType: KeyType.Ed25519,
  //       privateKey: TypedArrayEncoder.fromHex(privateKey),
  //     },
  //   ],
  // })

  const dids = await issuer.dids.getCreatedDids({ did })
  console.log('dids', JSON.stringify(dids))

  // Setting up shorten url

  // server.get('/url/:invitationId', async (req, res) => {
  //   const outOfBandRecord = await issuer.oob.findByCreatedInvitationId(req.params.invitationId)

  //   if (!outOfBandRecord || outOfBandRecord.state !== OutOfBandState.AwaitResponse)
  //     return res.status(404).send('Not found')

  //   const invitationJson = outOfBandRecord.outOfBandInvitation.toJSON({ useDidSovPrefixWhereAllowed: true })

  //   return res.header('content-type', 'application/json').send(invitationJson)
  // })

  // Create out of band invitation

  const usingDid = dids.find((record) => record.did.includes('did:web'))?.did

  console.log('\n\n\nusingDid***', usingDid)

  const { message } = await issuer.credentials.createOffer({
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: { id: usingDid! },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  })

  const { outOfBandInvitation } = await issuer.oob.createInvitation({
    autoAcceptConnection: true,
    messages: [message],
    handshakeProtocols: [HandshakeProtocol.Connections],
    handshake: true,
    label: 'JSON ld Issuer',
  })

  // Create short url for invitation
  const shortUrl = `${ngrokUrl}/url/${outOfBandInvitation.id}`
  const qrInvitation = await QRCode.toString(shortUrl, { type: 'terminal' })

  console.log(qrInvitation)
  console.log(shortUrl)
}

app()
