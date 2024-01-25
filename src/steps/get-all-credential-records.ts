import { holder } from '../holder'

async function app() {
  await holder.initialize()
  holder.config.logger.info('Agents initialized!')

  const credentials = await holder.credentials.getAll()

  console.log('Credentials', JSON.stringify(credentials, null, 2))

  const credentialDetailRecords: any = []

  for await (const cred of credentials) {
    const data = await holder.credentials.getFormatData(cred.id)

    credentialDetailRecords.push(data)
  }

  console.log('Credential Detail Records', JSON.stringify(credentialDetailRecords, null, 2))
}

app()
