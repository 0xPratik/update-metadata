import { Wallet } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import {createUpdateMetadataAccountV2Instruction,DataV2,UpdateMetadataAccountV2InstructionArgs,UpdateMetadataAccountV2InstructionAccounts} from "@metaplex-foundation/mpl-token-metadata"
const fs = require("fs");

(async() => {
    // This is the Update Authority Secret Key
    const secretKey = fs.readFileSync(
        "/Users/pratiksaria/.config/solana/id.json",
        "utf8"
      );
      const keypair = anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(secretKey))
      );
      const endpoint = "https://metaplex.devnet.rpcpool.com/";
  const connection = new anchor.web3.Connection(endpoint);

  const wallet = new Wallet(keypair);
  console.log("Connected Wallet", wallet.publicKey.toString());

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // You have to enter your NFT Mint address Over Here
  const mintKey = new anchor.web3.PublicKey("5iSxT33FyHWsnb8NYSytY17TTXfkFn62FiCyFVFxYhqY");

  const [metadatakey] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // BTW DeGods is my FAV collection although i cant afford one 🥲
  const updated_data: DataV2 = {
    name: "DeGods",
    symbol: "DG",
    uri: "https://metadata.degods.com/g/4924.json",
    sellerFeeBasisPoints: 1000,
    creators: [
      {
        address: new anchor.web3.PublicKey(
          "CsEYyFxVtXxezfLTUWYwpj4ia5oCAsBKznJBWiNKLyxK"
        ),
        verified: false,
        share: 0,
      },
      {
        address: wallet.publicKey,
        verified: false,
        share: 100,
      },
    ],
    collection: null,
    uses: null,
  };

  const accounts:UpdateMetadataAccountV2InstructionAccounts = {
    metadata: metadatakey,
    updateAuthority: wallet.publicKey,
  }

  const args:UpdateMetadataAccountV2InstructionArgs = {
    updateMetadataAccountArgsV2: {
      data: updated_data,
      updateAuthority: wallet.publicKey,
      primarySaleHappened: true,
      isMutable: true,
    }
  }

  const updateMetadataAccount = createUpdateMetadataAccountV2Instruction(
  accounts,
  args
  );

  const transaction = new anchor.web3.Transaction()
  transaction.add(updateMetadataAccount);
  const {blockhash} = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  const signedTx = await wallet.signTransaction(transaction);
  const txid = await connection.sendRawTransaction(signedTx.serialize());

  console.log("Transaction ID --",txid);

})()