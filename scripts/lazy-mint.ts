import { Contract, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { FactoryOptions } from 'hardhat/types'
import { Backend } from '../classes/Backend'
import { LazyMint } from '../classes/LazyMint'

async function main() {
	const signatureLib = await deploySignatureLibrary()
	const contract = await deployStoreContract(signatureLib)

	const voucher = await createVoucher()

	const signers = await ethers.getSigners()
	const owner = signers[0]

	const voucherCalldata = {
		uri: voucher.tokenUri,
		minPrice: voucher.costInWei,
		signature: voucher.signature,
	}

	console.log('Minting by voucher...')
	await contract.redeem(owner.address, voucherCalldata, { value: voucher.costInWei })

	console.log('Balance after mint: ', contract.balanceOf(owner.address))
}

async function deployStoreContract(signatureLibrary: Contract) {
	const factoryOptions: FactoryOptions = {
		libraries: {
			SignerVerification: signatureLibrary.address,
		},
	}

	const Contract = await ethers.getContractFactory('Opensea', factoryOptions)
	const contract = await Contract.deploy()
	await contract.deployed()
	return contract
}

async function deploySignatureLibrary() {
	const Library = await ethers.getContractFactory('SignerVerification')
	const lib = await Library.deploy()
	await lib.deployed()
	return lib
}

async function createVoucher() {
	const voucherCreator = new LazyMint()
	const backend = new Backend()

	const collection = backend.createCollection('FirstTimeEverCollection')

	const creator = new Wallet('1a3020d0842cee433b3a3958f96e6a3c662e487b5a268a824d96e091203836e3')

	const voucher = await voucherCreator.createVoucher(
		'https://lh3.googleusercontent.com/0zfTzUhYTgSQgjOPcha3SgCi7L-9u8MaKpbMHLLNdiAe1e6oZYYFxw-UqFuhvoCCoypEMPpHPIJ2Mayp0sMv3zFissvsI8VOeVjgJw=w600',
		collection.id,
		[
			{
				name: 'Strength',
				value: 10,
			},
		],
		0.01,
		creator
	)

	return voucher
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
