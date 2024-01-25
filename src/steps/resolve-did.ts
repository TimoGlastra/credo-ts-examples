import { issuer } from '../issuer'

async function app() {
  await issuer.initialize()
  issuer.config.logger.info('Agents initialized!')

  const did = await issuer.dids.resolve('did:polygon:testnet:0x26C2809EC8385bB15eb66586582e3D4626ee63C7')

  console.log('Resolved did', JSON.stringify(did, null, 2))
}

app()
