import { generateSecp256k1KeyPair } from 'afj-polygon-w3c-module'

async function app() {
  const keypair = await generateSecp256k1KeyPair()

  console.log('Secp Key Pair', JSON.stringify(keypair, null, 2))
}

app()
