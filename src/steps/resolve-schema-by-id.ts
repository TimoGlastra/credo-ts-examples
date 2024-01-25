import { issuer } from '../issuer'

async function app() {
  await issuer.initialize()
  issuer.config.logger.info('Agents initialized!')

  const schema = await issuer.modules.polygon.getSchemaById(
    'did:polygon:testnet:0x26C2809EC8385bB15eb66586582e3D4626ee63C7',
    '7dd91b6d-5ffd-43bb-aa9c-2ddce3afd72a'
  )

  console.log('Resolved schema', JSON.stringify(schema, null, 2))
}

app()
