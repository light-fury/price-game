// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IBinaryConfig {
    function setTradingFee(uint256 newTradingFee) external;

    function setClaimNoticePeriod(uint256 newNoticePeriod) external;

    function setTreasury(address newTreasury) external;
}
