function sendExcalidrawDataToBackground() {
  const excalidrawData = localStorage.getItem("excalidraw");
  console.log(excalidrawData);
  if (excalidrawData) {
    chrome.runtime.sendMessage({ action: "saveDrawing", data: excalidrawData });
  }
}
function injectButton() {
  const button = document.createElement("button");
  button.textContent = "Save to Google Drive";
  button.setAttribute(
    "style",
    "position: fixed; bottom: 20px; right: 20px; z-index: 1000;"
  );

  // Add event listener for click
  button.addEventListener("click", function () {
    sendExcalidrawDataToBackground(); // Your function to send data
  });

  document.body.appendChild(button);
}
injectButton();
