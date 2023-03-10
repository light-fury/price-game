import { ethers } from "hardhat";

export const latestBlockNumber = async () => {
	return await ethers.provider.getBlockNumber();
};

export const evm_increaseTime = async (seconds: number) => {
	await ethers.provider.send("evm_increaseTime", [seconds]);
};

export const evm_setNextBlockTimestamp = async (time: number) => {
	await ethers.provider.send("evm_setNextBlockTimestamp", [time]);
}

export const evm_mine_blocks = async (n: number) => {
	for (let i = 0; i < n; i++) {
		await ethers.provider.send("evm_mine", []);
	}
};
