import { KeyType, TypedArrayEncoder } from '@aries-framework/core'
import { issuer } from '../issuer'

async function app() {
  await issuer.initialize()
  issuer.config.logger.info('Agents initialized!')

  // const did = await issuer.dids.create({
  //   method: 'polygon',
  //   options: {
  //     keyType: KeyType.K256,
  //     network: 'testnet',
  //   },
  //   secret: {
  //     privateKey: TypedArrayEncoder.fromHex('24e1ae26a67d6f35f8b2d786015a54eff9b5f53534c1794f3848a52313fe579a'),
  //   },
  // })

  // console.log('Created Did', JSON.stringify(did, null, 2))

  const dids = await issuer.dids.getCreatedDids()

  const didRecords = dids.map((did) => {
    return {
      did: did.did,
      role: did.role,
    }
  })

  console.log('Get All did Records', JSON.stringify(didRecords, null, 2))
}

app()
