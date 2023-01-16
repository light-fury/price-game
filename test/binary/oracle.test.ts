import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai";
import { utils } from "ethers";
import { ethers } from "hardhat";
import { Oracle } from "../../typechain-types";
import { evm_setNextBlockTimestamp } from "../helper";

describe("Binary Option Trading - Oracle", () => {
  let owner: SignerWithAddress;
  let writer: SignerWithAddress;
  let notWriter: SignerWithAddress;

  let oracle: Oracle;

  const time = 12345;
  const price = utils.parseEther("1");

  before(async () => {
    [owner, writer, notWriter] = await ethers.getSigners();
  })

  beforeEach(async () => {
    const OracleFactory = await ethers.getContractFactory("Oracle");
    oracle = await OracleFactory.deploy();
    await oracle.deployed();
  })

  describe("Writer role", () => {
    it("should revert when adding invalid addresses", async () => {
      await expect(
        oracle.setWriter(ethers.constants.AddressZero, true)
      ).to.be.revertedWith("Invalid address");
    })
    it("should allow only admin to add writers", async () => {
      await expect(
        oracle.setWriter(writer.address, true)
      ).to.be.emit(oracle, "WriterUpdated").withArgs(writer.address, true);

      await expect(
        oracle.connect(writer).setWriter(writer.address, true)
      ).to.be.revertedWith("NOT_ORACLE_ADMIN");
    })
  })
  describe("Writing Price", () => {
    beforeEach(async () => {
      await oracle.setWriter(writer.address, true);
    })
    it("should permit writing price to only whitelisted writers", async () => {
      await expect(
        oracle.connect(notWriter).writePrice(0, time, price)
      ).to.be.revertedWith("NOT_ORACLE_WRITER");

      await expect(
        oracle.connect(writer).writePrice(0, time, price)
      ).to.be.emit(oracle, "WrotePrice").withArgs(writer.address, 0, 12345, price);

      const rounds = await oracle.rounds(0);
      expect(rounds.writer).to.be.equal(writer.address);
      expect(rounds.timestamp).to.be.equal(time);
      expect(rounds.price).to.be.equal(price);
      expect((await oracle.latestRoundData()).roundId).to.be.equal(0);
    })
    it("should revert when round id is not greater than last round id", async () => {
      await oracle.connect(writer).writePrice(0, time, price)
      expect((await oracle.latestRoundData()).roundId).to.be.equal(0);

      await expect(
        oracle.connect(writer).writePrice(1, time + 1, price)
      ).to.be.emit(oracle, "WrotePrice").withArgs(writer.address, 1, time + 1, price);
      expect((await oracle.latestRoundData()).roundId).to.be.equal(1);
    })
    it("should revert when the time is not greater than prev round", async () => {
      await oracle.connect(writer).writePrice(0, time, price)
      expect((await oracle.latestRoundData()).roundId).to.be.equal(0);

      // Can't write price before than the prev round
      await expect(
        oracle.connect(writer).writePrice(1, time - 1, price)
      ).to.be.revertedWith("Invalid Timestamp");
      
      await expect(
        oracle.connect(writer).writePrice(1, time + 1, price)
      ).to.be.emit(oracle, "WrotePrice").withArgs(writer.address, 1, time + 1, price);
      expect((await oracle.latestRoundData()).roundId).to.be.equal(1);
    })
  })

  describe("Writing Batch Prices", () => {
    beforeEach(async () => {
      await oracle.setWriter(writer.address, true);
    })
    it("should revert when input array lengths mismatch", async () => {
      await expect(
        oracle.connect(writer).writeBatchPrices(
          [0, 1, 2],
          [time, time + 1, time + 2],
          [price, price]
        )
      ).to.be.revertedWith("Invalid array length");
      await expect(
        oracle.connect(writer).writeBatchPrices(
          [0, 1, 2],
          [time, time + 1],
          [price, price, price]
        )
      ).to.be.revertedWith("Invalid array length");
    })
    it("should revert when rounds are not in sequence", async () => {
      await expect(
        oracle.connect(writer).writeBatchPrices(
          [0, 1, 2],
          [time, time - 1, time + 2],
          [price, price, price]
        )
      ).to.be.revertedWith("Invalid Timestamp");

      await expect(
        oracle.connect(writer).writeBatchPrices(
          [0, 2, 1],
          [time, time + 1, time + 2],
          [price, price, price]
        )
      ).to.be.revertedWith("Invalid Timestamp");
    })
    it("should permit batch writing to only writer role", async () => {
      await expect(
        oracle.writeBatchPrices(
          [0, 1, 2],
          [time, time + 1, time + 2],
          [price, price, price]
        )
      ).to.be.revertedWith("NOT_ORACLE_WRITER");

      await expect(
        oracle.connect(writer).writeBatchPrices(
          [0, 1, 2],
          [time, time + 1, time + 2],
          [price, price, price]
        )
      ).to.be.emit(oracle, "WrotePrice");
    })
  })

  describe("Getting Price", () => {
    beforeEach(async () => {
      await oracle.setWriter(writer.address, true);
      await oracle.connect(writer).writeBatchPrices(
        [0, 1, 2],
        [time, time + 1, time + 2],
        [price, price, price]
      )
    })
    it("should return price data by round id", async () => {
      let round = await oracle.getRoundData(0);
      expect(round.price).to.be.equal(price);
      expect(round.timestamp).to.be.equal(time);

      round = await oracle.getRoundData(1);
      expect(round.price).to.be.equal(price);
      expect(round.timestamp).to.be.equal(time + 1);
    })
    it("should revert when getting price by invalid round id", async () => {
      await expect(
        oracle.getRoundData(5)
      ).to.be.revertedWith("Invalid Round ID");
    })
  })
})