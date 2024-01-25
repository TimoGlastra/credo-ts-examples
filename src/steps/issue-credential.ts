import { KeyType, TypedArrayEncoder } from '@aries-framework/core'
import { issuer } from '../issuer'
import { holder } from '../holder'

async function app() {
  await issuer.initialize()
  await holder.initialize()
  issuer.config.logger.info('Agents initialized!')

  const holderDid = await holder.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
    },
    secret: {
      privateKey: TypedArrayEncoder.fromString('afjdemoverysecure000000000000key'),
    },
  })

  // Polygon did
  const issuerDid = 'did:polygon:testnet:0x26C2809EC8385bB15eb66586582e3D4626ee63C7'

  await issuer.dids.import({
    did: issuerDid,
    overwrite: true,
    privateKeys: [
      {
        keyType: KeyType.K256,
        privateKey: TypedArrayEncoder.fromHex('7229440234c231c8dc067ef2425bc694f202514779a02876c1d273b00adf66fb'),
      },
    ],
  })

  // Polygon did

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })
  const { connectionRecord } = await issuer.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  const credRecord = await issuer.credentials.offerCredential({
    connectionId: connectionRecord.id,
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: { id: issuerDid },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: holderDid.didState.did!,
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'EcdsaSecp256k1Signature2019',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  })
}

app()
