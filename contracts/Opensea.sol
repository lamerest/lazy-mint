//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import 'erc721a/contracts/ERC721A.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './libs/SignerVerification.sol';

contract Opensea is ERC721A, Ownable {
	mapping(address => Role) participantsRoles;
	mapping(uint256 => string) uriByTokenId;
	mapping(address => uint256) private pendingWithdrawals;

	enum Role {
		MINTER,
		OWNER,
		ADMIN
	}

	struct NFTVoucher {
		string uri;
		uint256 minPrice;
		string signature;
	}

	constructor() ERC721A('OPENSEA', 'OPNS') {}

	function redeem(address redeemer, NFTVoucher calldata voucher) public payable returns (uint256) {
		// make sure signature is valid and get the address of the signer
		address signer = SignerVerification.getSigner(bytes(voucher.signature), getConcatenatedParams(voucher));

		// make sure that the signer is authorized to mint NFTs
		require(hasRole(Role.MINTER, signer), 'Signature invalid or unauthorized');

		// make sure that the redeemer is paying enough to cover the buyer's cost
		require(msg.value >= voucher.minPrice, 'Insufficient funds to redeem');

		// first assign the token to the signer, to establish provenance on-chain
		_safeMint(redeemer, 1);
		_setTokenURI(_currentIndex, voucher.uri);

		// record payment to signer's withdrawal balance
		pendingWithdrawals[signer] += msg.value;

		return _currentIndex;
	}

	function hasRole(Role role, address addressToCheck) public returns (bool) {
		return participantsRoles[addressToCheck] == role;
	}

	function getConcatenatedParams(NFTVoucher calldata voucher) internal returns (string memory) {
		return string(abi.encode(voucher.uri, Strings.toString(voucher.minPrice)));
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		return uriByTokenId[tokenId];
	}

	function _setTokenURI(uint256 tokenId, string calldata uri) internal {
		uriByTokenId[tokenId] = uri;
	}

	function withdraw() external {
		require(pendingWithdrawals[msg.sender] > 0, 'No withdrawal available');
		payable(address(msg.sender)).transfer(pendingWithdrawals[msg.sender]);
	}
}
