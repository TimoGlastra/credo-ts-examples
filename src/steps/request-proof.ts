import { holder } from '../holder'
import { verifier } from '../verifier'

async function app() {
  await holder.initialize()
  await verifier.initialize()
  verifier.config.logger.info('Agents initialized!')

  // Polygon did

  // Create out of band invitation

  const inv = await holder.oob.createLegacyInvitation({
    autoAcceptConnection: true,
  })

  const { connectionRecord } = await verifier.oob.receiveInvitation(inv.invitation)
  if (!connectionRecord) {
    throw new Error('Connection not found')
  }

  await verifier.connections.returnWhenIsConnected(connectionRecord.id)

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
                    path: ['$.credentialSubject.degree.type'],
                  },
                ],
              },
              id: 'citizenship_input_1',
              schema: [{ uri: 'https://www.w3.org/2018/credentials/examples/v1' }],
            },
          ],
        },
      },
    },
    protocolVersion: 'v2',
  })
}

app()
