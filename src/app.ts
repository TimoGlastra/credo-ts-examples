import console from 'console'
import { issuer } from './issuer'
import { holder } from './holder'
import {
  DidDocument,
  DidDocumentBuilder,
  JsonTransformer,
  KeyType,
  OutOfBandState,
  TypedArrayEncoder,
  getEd25519VerificationKey2018,
  SECURITY_CONTEXT_BBS_URL,
  CREDENTIALS_CONTEXT_V1_URL,
} from '@aries-framework/core'
import { Bls12381g2SigningProvider, Bls12381G2KeyPair } from '@aries-framework/bbs-signatures'

async function app() {
  await issuer.initialize()
  await holder.initialize()
  issuer.config.logger.info('Agents initialized!')

  const keyPair = await Bls12381G2KeyPair.generate({
    seed: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  })

  console.log('keyPair', keyPair)

  // issuer.dependencyManager.in

  // const domain = 'sairanjit.github.io'
  // const did = `did:web:${domain}`
  // const keyId = `${did}#key-1`

  // const did =
  //   'did:key:zUC7GGzAkrEYjngGiv1xSHaQcssHppqKcQD8ktLSUjk8C22WSemP4MqWR6GGynqih6DCCQ8zafn1u2pEUHo24JJs2UwxoLuHB8M1gGyBPhAyjH3a7mx8kP5wRQXLLMPGGgFP8tS'

  // const key = await issuer.wallet.createKey({
  //   keyType: KeyType.Bls12381g2,
  //   // privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  //   seed: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  // })

  // console.log('first key publicKeyBase58', key.publicKeyBase58)

  // const didDocument = new DidDocumentBuilder(did)
  //   .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
  //   .addVerificationMethod(getEd25519VerificationKey2018({ key, id: keyId, controller: did }))
  //   .addAuthentication(keyId)
  //   .build()

  // await issuer.dids.import({
  //   did,
  //   overwrite: true,
  //   privateKeys: [
  //     {
  //       keyType: KeyType.Bls12381g2,
  //       privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
  //     },
  //   ],
  //   // didDocument,
  // })

  // BBS
  const newdid = await issuer.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Bls12381g2,
      privateKey: TypedArrayEncoder.fromString('afjdemoverysercure00000000000000'),
    },
  })
  console.log('did create result', newdid)
  // BBS

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

  // const dids = await issuer.dids.getCreatedDids({ method: 'key' })
  // console.log('dids', JSON.stringify(dids))

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })
  const { connectionRecord } = await issuer.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  // const usingDid = dids.find((record) => record.did.includes('did:key'))?.did

  // console.log('\n\n\nusingDid***', usingDid)

  const credRecord = await issuer.credentials.offerCredential({
    connectionId: connectionRecord.id,
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': [
            CREDENTIALS_CONTEXT_V1_URL,
            'https://www.w3.org/2018/credentials/examples/v1',
            SECURITY_CONTEXT_BBS_URL,
          ],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: newdid.didState.did!,
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'BbsBlsSignature2020',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  })
}

app()
