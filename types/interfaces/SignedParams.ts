export interface SignedParams {
	signature: string
	expirationTimestampInSeconds: number
	mutationId: number
	weiCost: string
}

export type SignedParamsArray = [string, number, string, number]
