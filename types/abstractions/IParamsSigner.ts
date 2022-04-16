import { SignedParams } from '../interfaces/SignedParams'

export abstract class IParamsSigner {
	abstract getPublicKey(): Promise<string> | string
	abstract getSignedMintCallParams(mutationId: number, ethCost: number): Promise<SignedParams>
}
