const liquid = require('liquidjs-lib');
const AMOUNT_PER_ASSET = require('./assets');
const {
  walletFromKeys,
  createTx,
  blindTx,
  signTx,
  broadcastTx,
} = require('./wallet');



async function getAddressInfo(signWif, blindWif) {
  const { addressInfo } = await walletFromKeys(signWif, blindWif);
  return addressInfo;
}

async function send(to, asset, signWif, blindWif, explorerUrl) {

  const ASSETS = Object.keys(AMOUNT_PER_ASSET);
  if (!ASSETS.includes(asset))
    throw new Error('asset not supported, must be one of ' + ASSETS);

  try {
    liquid.address.toOutputScript(to, liquid.networks.testnet);
  } catch (e) {
    throw new Error('invalid address');
  }


  try {
    const { addressInfo, privateKey } = await walletFromKeys(signWif, blindWif);

    console.debug(`Creating tx of ${asset} for ${to}`);
    const unsignedTx = await createTx(
      addressInfo,
      {
        to,
        asset,
        amount: AMOUNT_PER_ASSET[asset],
      },
      explorerUrl
    );

    console.debug(`Blinding tx...`);
    const blindedTx = await blindTx(unsignedTx, to, privateKey);

    console.debug(`Signing tx...`);
    const signedTxHex = await signTx(blindedTx, privateKey);

    console.debug(`Broadcasting tx...`);
    const txid = await broadcastTx(signedTxHex, explorerUrl);

    console.debug(`Success! ${txid}`);
    return txid;
  } catch (e) {
    throw e;
  }
}



module.exports = {
  getAddressInfo,
  send,
}