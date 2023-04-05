<script lang="typescript">
  import { Html5Qrcode } from 'html5-qrcode';
  import { onDestroy, onMount } from 'svelte';
  import type { FaucetResponse } from './util/api';
  import { fetchAssets, requestAsset } from './util/api';
  import loader from './util/loader';

  let address: string;
  // Default to L-BTC
  let asset =
    '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49';
  let isModalActive = false;
  let qrCodeScanner = null;

  $: network = undefined;

  let faucetLoading = false;
  let faucetPromise: Promise<FaucetResponse>;

  function handleClick() {
    if (!address || address.length === 0 || !asset) return;
    faucetPromise = loader(requestAsset({ to: address, asset }), (loading) => {
      faucetLoading = loading;
    });
  }

  const closeScannerModal = () => {
    isModalActive = false;
    qrCodeScanner.stop();
  };

  onMount(() => {
    const startScanner = () => {
      isModalActive = true;
      address = null;
      qrCodeScanner.start(
        { facingMode: 'environment' },
        { fps: 10 },
        onScanSuccess,
        onScanFailure
      );
    };

    const onScanSuccess = (decodedText) => {
      address = decodedText;
      closeScannerModal();
    };

    const onScanFailure = (error) => {
      console.debug(`Code scan error = ${error}`);
    };

    qrCodeScanner = new Html5Qrcode('qr-code-scanner');

    const icon = document.querySelector('.is-clickable');
    icon.addEventListener('click', () => {
      startScanner();
    });
  });

  onDestroy(() => {
    qrCodeScanner.clear();
  });
</script>

<section class="hero has-background-black is-fullheight">
  <div class="hero-body">
    <div class="container is-max-desktop has-text-centered">
      <div class="mb-6">
        <h1 class="title has-text-white is-size-2">🚰 Faucet</h1>
        <p class="subtitle is-6 is-size-5">Liquid Network Testnet</p>
      </div>

      <div class="column is-8  is-offset-2">
        <div class="field is-flex is-grouped is-grouped-centered">
          <div class="field column is-4-mobile is-3-tablet is-2-desktop">
            <div class="control">
              <div class="select is-primary">
                <select bind:value={asset} id="asset">
                  {#await fetchAssets() then assets}
                    {#each Object.entries(assets.assets) as [hash, ticker]}
                      <option value={hash}>{ticker}</option>
                    {/each}
                  {/await}
                </select>
              </div>
            </div>
          </div>

          <div class="field column is-8-mobile is-9-tablet is-10-desktop">
            <div class="control has-icons-right">
              <input
                bind:value={address}
                class="input is-primary"
                id="address"
                placeholder="Liquid testnet address"
                type="text"
              />
              <span class="icon is-clickable is-right">
                <i class="fas fa-qrcode" />
              </span>
            </div>
          </div>
        </div>

        <button
          class="button is-primary button__request"
          class:is-loading={faucetLoading}
          disabled={!address || address === ''}
          on:click={handleClick}
        >
          REQUEST
        </button>
      </div>

      {#if faucetPromise}
        {#await faucetPromise then { txid }}
          <div class="column is-10 is-offset-1 mt-6">
            <p class="has-text-white">
              Transaction ID:
              <a
                class="is-family-code"
                href="https://blockstream.info/liquidtestnet/tx/{txid}"
                rel="noreferrer"
                target="_blank"
              >
                {txid}
              </a>
            </p>
          </div>
        {:catch error}
          <p class="has-text-danger mt-6">
            {error?.message ?? 'Unknown Error'}
          </p>
        {/await}
      {/if}
    </div>
  </div>
</section>

<div class="modal" class:is-active={isModalActive}>
  <div
    class="modal-background"
    on:click={closeScannerModal}
    on:keypress={closeScannerModal}
  />
  <div class="modal-content">
    <div id="qr-code-scanner" />
  </div>
  <button
    aria-label="close"
    class="modal-close is-large"
    on:click={closeScannerModal}
  />
</div>

<style global lang="scss" src="./scss/main.scss"></style>
