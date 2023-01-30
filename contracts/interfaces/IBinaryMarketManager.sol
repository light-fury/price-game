// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./IOracle.sol";
import "./IBinaryVault.sol";
import "./IBinaryMarket.sol";

interface IBinaryMarketManager {
    function createMarket(
        address oracle_,
        address vault_,
        string memory marketName_,
        string memory pairName_,
        IBinaryMarket.TimeFrame[] memory timeframes_,
        address adminAddress_,
        address operatorAddress_,
        uint256 minBetAmount_
    ) external;
}