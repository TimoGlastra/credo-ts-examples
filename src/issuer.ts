import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
} from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { AskarModule } from '@aries-framework/askar'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  ConnectionsModule,
  ConsoleLogger,
  CredentialsModule,
  DidsModule,
  HttpOutboundTransport,
  LogLevel,
  ProofsModule,
  V2CredentialProtocol,
  V2ProofProtocol,
} from '@aries-framework/core'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import {
  CheqdAnonCredsRegistry,
  CheqdDidRegistrar,
  CheqdDidResolver,
  CheqdModule,
  CheqdModuleConfig,
} from '@aries-framework/cheqd'

export const issuer = new Agent({
  config: {
    label: 'Issuer Agent',
    walletConfig: {
      id: 'issuer-agent',
      key: 'issuer-agent-key',
    },
    endpoints: ['http://localhost:6006/didcomm'],
    // Change to view logs in terminal
    logger: new ConsoleLogger(LogLevel.debug),
  },
  modules: {
    // Storage
    askar: new AskarModule({
      ariesAskar,
    }),

    // Connections module is enabled by default, but we can
    // override the default configuration
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),

    // Credentials module is enabled by default, but we can
    // override the default configuration
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.Always,

      // Support v2 protocol
      credentialProtocols: [
        new V2CredentialProtocol({
          credentialFormats: [new AnonCredsCredentialFormatService()],
        }),
      ],
    }),

    // Proofs module is enabled by default, but we can
    // override the default configuration
    proofs: new ProofsModule({
      autoAcceptProofs: AutoAcceptProof.ContentApproved,

      // Support v2 protocol
      proofProtocols: [
        new V2ProofProtocol({
          proofFormats: [new AnonCredsProofFormatService()],
        }),
      ],
    }),

    // Dids
    // dids: new DidsModule({
    //   // Support creation of did:indy, did:key dids
    //   // registrars: [new KeyDidRegistrar()],
    //   // Support resolving of did:indy, did:sov, did:key and did:web dids
    //   resolvers: [new WebDidResolver()],
    // }),
    dids: new DidsModule({
      resolvers: [new CheqdDidResolver()],
      registrars: [new CheqdDidRegistrar()],
    }),

    // AnonCreds
    anoncreds: new AnonCredsModule({
      // Support indy anoncreds method
      registries: [new CheqdAnonCredsRegistry()],
    }),
    // Use anoncreds-rs as anoncreds backend
    _anoncreds: new AnonCredsRsModule({
      anoncreds,
    }),

    // Configure cheqd
    cheqd: new CheqdModule(
      new CheqdModuleConfig({
        networks: [
          {
            network: 'testnet',
            // cosmosPayerSeed: '00000000000000000000000000cheqd2'
            cosmosPayerSeed:
              'robust across amount corn curve panther opera wish toe ring bleak empower wreck party abstract glad average muffin picnic jar squeeze annual long aunt',
          },
        ],
      })
    ),
  },
  dependencies: agentDependencies,
})

issuer.registerInboundTransport(
  new HttpInboundTransport({
    port: 6006,
    path: '/didcomm',
  })
)
issuer.registerOutboundTransport(new HttpOutboundTransport())
