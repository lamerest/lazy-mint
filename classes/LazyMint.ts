import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, Signer, Wallet } from 'ethers'
import { LazyNFTVoucher } from '../types/interfaces/LazyNFTVoucher'
import { NFTProperty } from '../types/interfaces/NFTProperties'
import { NETWORK_CURRENCY_DECIMALS } from '../utils/constants'

export class LazyMint {
	async createVoucher(
		tokenUri: string,
		collectionId: number,
		properties: NFTProperty[],
		costInEther: number,
		signer: SignerWithAddress | Wallet | Signer
	): Promise<LazyNFTVoucher> {
		console.log(`Binding voucher to collection by collcetionId (${collectionId})...`)
		console.log('Writing properties to DB...', properties)

		const costInWei = BigNumber.from((costInEther * 10 ** NETWORK_CURRENCY_DECIMALS).toString())
		const signature = await signer.signMessage(tokenUri + costInEther)

		return {
			tokenUri,
			costInWei,
			signature,
		}
	}
}
