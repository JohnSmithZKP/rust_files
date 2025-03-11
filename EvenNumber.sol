// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
import {ImageID} from "./ImageID.sol";

contract EvenNumber {

    IRiscZeroVerifier public immutable verifier;
    bytes32 public constant imageId = ImageID.IS_EVEN_ID;

    bytes32[] public hashes;
    uint256 public currentIndex = 1;
    uint56 treeDepth = 3;

    address public admin;


    constructor(IRiscZeroVerifier _verifier) {
        admin = msg.sender;
        verifier = _verifier;

        for (uint i = 0; i < 2**treeDepth; i++) {

            hashes.push(sha256(abi.encodePacked(hex"00")));
        }

        uint n = 2**treeDepth;
        uint offset = 0;

        while (n > 0) {
            for (uint i = 0; i < n - 1; i += 2) {
                hashes.push(
                    sha256(
                        abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])
                    )
                );
            }
            offset += n;
            n = n / 2;
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }


    function getRoot() public view returns (bytes32) {
        return hashes[hashes.length - 1];
    }


    function getHash(uint256 index) public view returns (bytes32) {
        return hashes[index];
    }

    function addCommitment(bytes32 _commitment) public onlyAdmin{
        hashes[currentIndex] = _commitment;
        currentIndex = currentIndex + 1;

        uint n = 2**treeDepth;
        uint offset = 0;
        uint p = n;
        
        while (n > 0) {
            for (uint i = 0; i < n - 1; i += 2) {
                hashes[p] = (
                    sha256(
                        abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])
                    )
                );
                p +=1;
            }
            offset += n;
            n = n / 2;
        }

    }

    function verify(string memory root, string memory lang, string memory lang_size, bytes calldata seal) view public returns (bool){
        // Construct the expected journal data. Verify will fail if journal does not match.
        bytes memory journal = abi.encode(root, lang, lang_size);
        verifier.verify(seal, imageId, sha256(journal));
        return true;
    }


}