import { issuer } from './issuer'
import { holder } from './holder'
import { KeyType, TypedArrayEncoder, V2CredentialPreview } from '@aries-framework/core'
import { uuid } from '@aries-framework/core/build/utils/uuid'

async function app() {
  await issuer.initialize()
  await holder.initialize()
  await holder.modules.anoncreds.createLinkSecret()
  issuer.config.logger.info('Agents initialized!')

  let anoncredsIssuerId = ''

  // NOTE: we assume the did is already registered on the ledger, we just store the private key in the wallet
  // and store the existing did in the wallet
  const privateKey = TypedArrayEncoder.fromString('afjdemoverysercure00000000000003')

  // Create key
  await issuer.wallet
    .createKey({
      keyType: KeyType.Ed25519,
      privateKey,
    })
    .then((data) => console.log('[createKey] data', JSON.stringify(data)))
    .catch((error) => console.log('[createKey] error', error))

  // Publish did
  const didResult = await issuer.dids.create({
    method: 'cheqd',
    secret: {
      verificationMethod: {
        id: 'key-1',
        type: 'JsonWebKey2020',
      },
    },
    options: {
      network: 'testnet',
    },
  })

  if (didResult.didState.did) {
    console.log(`DID: ${didResult.didState.did}`)
    anoncredsIssuerId = didResult.didState.did
  } else {
    console.log('Failed to register DID, try again')
  }

  // Register Schema
  const schemaTemplate = {
    name: 'Faber College' + uuid(),
    version: '1.0.0',
    attrNames: ['name', 'degree', 'age'],
    issuerId: anoncredsIssuerId,
  }
  console.log(schemaTemplate.name, schemaTemplate.version, schemaTemplate.attrNames)
  console.log('Registering schema...')

  const { schemaState } = await issuer.modules.anoncreds.registerSchema({
    schema: schemaTemplate,
    options: {},
  })

  if (!schemaState.schemaId) {
    throw new Error(`Invalid schema ${schemaState.schemaId}`)
  }

  // Create Cred Def
  const { credentialDefinitionState } = await issuer.modules.anoncreds.registerCredentialDefinition({
    credentialDefinition: {
      schemaId: schemaState.schemaId,
      issuerId: anoncredsIssuerId,
      tag: 'latest',
    },
    options: {},
  })

  if (!credentialDefinitionState.credentialDefinitionId) {
    throw new Error(`Invalid credentialDefinition ${credentialDefinitionState.credentialDefinitionId}`)
  }

  // Create credential preview
  const credentialPreview = V2CredentialPreview.fromRecord({
    name: 'Alice Smith',
    degree: 'Computer Science',
    age: '22',
  })

  // Create out of band invitation

  const inv = await holder.oob.createInvitation({
    autoAcceptConnection: true,
  })
  const { connectionRecord } = await issuer.oob.receiveInvitation(inv.outOfBandInvitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await issuer.connections.returnWhenIsConnected(connectionRecord.id)

  const credRecord = await issuer.credentials.offerCredential({
    connectionId: connectionRecord.id,
    protocolVersion: 'v2',
    credentialFormats: {
      anoncreds: {
        attributes: credentialPreview.attributes,
        credentialDefinitionId: credentialDefinitionState.credentialDefinitionId,
      },
    },
  })
}

app()
