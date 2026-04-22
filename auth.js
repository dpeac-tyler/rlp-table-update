const PASSWORD = "rlp";

(function () {
  const saved = sessionStorage.getItem("rlp_auth");
  if (saved === "true") return;

  const input = prompt("Enter password:");
  if (input === PASSWORD) {
    sessionStorage.setItem("rlp_auth", "true");
    return;
  }

  document.documentElement.innerHTML = `
    <head><title>Access Denied</title></head>
    <body style="font-family: Arial, sans-serif; padding: 40px;">
      <h1>Access Denied</h1>
      <p>Wrong password.</p>
    </body>
  `;
})();
