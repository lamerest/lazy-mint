import { expect } from 'chai'
import { isBytesLike, verifyMessage } from 'ethers/lib/utils'
import { IParamsToSign, MockParamsSigner } from '../../classes/MockParamsSigner'
import { IParamsSigner } from '../../types/abstractions/IParamsSigner'

describe.skip('MockParamsSigner', async () => {
	let signer: IParamsSigner

	before(async () => {
		signer = new MockParamsSigner()
	})

	it('Should return correct types of params', async () => {
		const { expirationTimestampInSeconds, weiCost, signature, mutationId } = await signer.getSignedMintCallParams(
			0,
			1
		)

		expect(expirationTimestampInSeconds).to.be.a('number')
		const min = Date.now() / 1000 + 19 * 60
		const max = Date.now() / 1000 + 21 * 60
		// Expect timestamp to be between 19 and 21 minutes after signing
		expect(expirationTimestampInSeconds).to.be.within(min, max)

		expect(isBytesLike(signature)).to.be.true

		expect(weiCost).to.be.equal('1' + '0'.repeat(18))

		expect(mutationId).to.be.equal(0)
	})

	it('Must decrypt publicKey', async () => {
		const params = await signer.getSignedMintCallParams(0, 1)
		const concatenatedParams = concatParams(params)
		const recoveredAddress = verifyMessage(concatenatedParams, params.signature)
		const actualPublicKey = await signer.getPublicKey()
		expect(recoveredAddress).to.be.equal(actualPublicKey)
	})
})

function concatParams(params: IParamsToSign): string {
	const { expirationTimestampInSeconds, weiCost, mutationId } = params
	return `${expirationTimestampInSeconds}${weiCost}${mutationId}`
}
