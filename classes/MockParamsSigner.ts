import { ethers } from 'hardhat'
import { parseEther } from 'ethers/lib/utils'
import { IParamsSigner } from '../types/abstractions/IParamsSigner'
import { ISignedParams } from '../types/interfaces/signed-params'

export interface IParamsToSign {
	expirationTimestampInSeconds: number
	weiCost: string
	mutationId: number
}

export class MockParamsSigner implements IParamsSigner {
	private MILLISECONDS_IN_SECOND = 1000
	private TWENTY_MINUTES_IN_MS = this.MILLISECONDS_IN_SECOND * 60 * 20

	private privateKey = '75657fb7b141cf34b315db3601e393ca61da42b07d67dc0c6155b19e58e8f35f'

	async getPublicKey(): Promise<string> {
		const wallet = new ethers.Wallet(this.privateKey)
		return await wallet.getAddress()
	}

	constructor(privateKey?: string) {
		if (privateKey == null) return
		this.privateKey = privateKey
	}

	async getSignedMintCallParams(mutationId: number, ethCost: number): Promise<ISignedParams> {
		const weiAmount = parseEther(ethCost.toString())
		const wei = weiAmount.toString()

		const params: IParamsToSign = {
			mutationId,
			weiCost: wei,
			expirationTimestampInSeconds: this.getExpiredDateInSeconds(),
		}

		const concatenatedParams = this.concatenateParams(params)
		const signature = await this.getSignature(concatenatedParams)
		return this.getSctructWithParamsAndSignature(params, signature)
	}

	private getExpiredDateInSeconds(): number {
		const dateNowInMs = Date.now()
		const expiredDateInMs = dateNowInMs + this.TWENTY_MINUTES_IN_MS
		return Math.trunc(expiredDateInMs / this.MILLISECONDS_IN_SECOND)
	}

	private concatenateParams(params: IParamsToSign): string {
		const { expirationTimestampInSeconds, weiCost, mutationId } = params
		return `${expirationTimestampInSeconds}${weiCost}${mutationId}`
	}

	private async getSignature(data: string): Promise<string> {
		const signer = new ethers.Wallet(this.privateKey)
		return await signer.signMessage(data)
	}

	private getSctructWithParamsAndSignature(params: IParamsToSign, signature: string): ISignedParams {
		const { expirationTimestampInSeconds, weiCost, mutationId } = params
		return {
			signature,
			expirationTimestampInSeconds,
			weiCost,
			mutationId,
		}
	}
}
