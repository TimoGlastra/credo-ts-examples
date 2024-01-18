import { issuer } from './issuer'
import { holder } from './holder'
import { verifier } from './verifier'

import {
  DidDocument,
  DidDocumentBuilder,
  JsonTransformer,
  KeyType,
  OutOfBandState,
  TypedArrayEncoder,
  getBls12381G2Key2020,
  getEd25519VerificationKey2018,
} from '@aries-framework/core'
import { PolygonDID } from '@ayanworks/polygon-did-registrar'

async function app() {
  // await issuer.initialize()
  await holder.initialize()
  await verifier.initialize()
  // issuer.config.logger.info('Agents initialized!')
  verifier.config.logger.info('Agents initialized!')

  // const credentials = await holder.w3cCredentials.getAllCredentialRecords()

  // console.log('credentials', JSON.stringify(credentials))

  // const keypair = await PolygonDID.createKeyPair('testnet')
  // console.log('keypair', keypair)

  // const value = await issuer.wallet.createKey({
  //   keyType: KeyType.K256,
  //   seed: TypedArrayEncoder.fromString('afjdemoverysercure00000000000key'),
  // })

  // const issuerDid = await issuer.dids.create({
  //   method: 'polygon',
  //   options: {
  //     keyType: KeyType.K256,
  //     network: 'testnet',
  //   },
  //   secret: {
  //     privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000issuer'),
  //   },
  // })

  // console.log('value', issuerDid)

  // const holderDid = await holder.dids.create({
  //   method: 'key',
  //   options: {
  //     keyType: KeyType.Ed25519,
  //   },
  //   secret: {
  //     privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000key'),
  //   },
  // })

  // Polygon did
  // const issuerDid = 'did:polygon:testnet:0x26C2809EC8385bB15eb66586582e3D4626ee63C7'

  // await issuer.dids.import({
  //   did: issuerDid,
  //   overwrite: true,
  //   privateKeys: [
  //     {
  //       keyType: KeyType.K256,
  //       privateKey: TypedArrayEncoder.fromHex('7229440234c231c8dc067ef2425bc694f202514779a02876c1d273b00adf66fb'),
  //     },
  //   ],
  // })

  // Polygon did

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })
  // const { connectionRecord } = await issuer.oob.receiveInvitation(inv.invitation)
  // if (!connectionRecord) {
  //   throw new Error('Connection not found')
  // }

  // await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  const { connectionRecord } = await verifier.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await verifier.connections.returnWhenIsConnected(connectionRecord.id)

  // const usingDid = dids.find((record) => record.did.includes('did:web'))?.did

  // console.log('\n\n\nusingDid***', usingDid)

  // console.log('connectionRecord.did', connectionRecord.did)

  // const credRecord = await issuer.credentials.offerCredential({
  //   connectionId: connectionRecord.id,
  //   credentialFormats: {
  //     jsonld: {
  //       credential: {
  //         '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
  //         type: ['VerifiableCredential', 'UniversityDegreeCredential'],
  //         issuer: { id: issuerDid },
  //         issuanceDate: new Date().toISOString(),
  //         credentialSubject: {
  //           id: holderDid.didState.did!,
  //           degree: {
  //             type: 'BachelorDegree',
  //             name: 'Bachelor of Science and Arts',
  //           },
  //         },
  //       },
  //       options: {
  //         proofType: 'EcdsaSecp256k1Signature2019',
  //         proofPurpose: 'assertionMethod',
  //       },
  //     },
  //   },
  //   protocolVersion: 'v2',
  // })

  const proofRecord = await verifier.proofs.requestProof({
    connectionId: connectionRecord.id,
    proofFormats: {
      presentationExchange: {
        presentationDefinition: {
          id: '32f54163-7166-48f1-93d8-ff217bdb0653',
          input_descriptors: [
            {
              constraints: {
                fields: [
                  {
                    path: ['$.credentialSubject.degree.typ'],
                  },
                ],
              },
              id: 'citizenship_input_1',
              schema: [{ uri: 'https://www.w3.org/2018/credentials/examples/v1' }],
            },
          ],
          // format: {
          //   ldp_vc: {
          //     proof_type: ['EcdsaSecp256k1Signature2019'],
          //   },
          // },
        },
      },
    },
    protocolVersion: 'v2',
  })
}

app()
