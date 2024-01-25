import { verifier } from '../verifier'

async function app() {
  await verifier.initialize()
  verifier.config.logger.info('Agents initialized!')

  const proofs = await verifier.proofs.getAll()

  console.log('Proof Records', JSON.stringify(proofs, null, 2))

  const proofDetailRecords: any = []

  for await (const proof of proofs) {
    const data = await verifier.proofs.getFormatData(proof.id)

    proofDetailRecords.push(data)
  }

  console.log('Proof Detail Records', JSON.stringify(proofDetailRecords, null, 2))
}

app()
