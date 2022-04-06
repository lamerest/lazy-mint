// eslint-disable @typescript-eslint/no-explicit-any

import { TransactionResponse } from '@ethersproject/providers'

// Here you can define types that will expand standard libraries' types

// Example:
declare module 'ethers' {
	export type TransactionResponseWithEvents = TransactionResponse & {
		events: any[]
	}
}
