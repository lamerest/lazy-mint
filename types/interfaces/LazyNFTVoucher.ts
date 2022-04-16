import { BigNumber } from 'ethers'

export interface LazyNFTVoucher {
	tokenUri: string
	costInWei: BigNumber
	signature: string
}
