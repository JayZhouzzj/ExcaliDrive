const sendExcalidrawDataToBackground = () => {
  const excalidrawData = localStorage.getItem("excalidraw");
  if (excalidrawData) {
    chrome.runtime.sendMessage({ action: "saveDrawing", data: excalidrawData });
  }
};
const requestExcalidrawDataFromBackground = () => {
  chrome.runtime.sendMessage({ action: "loadDrawing" });
};
const injectSaveButton = () => {
  const button = document.createElement("button");
  button.textContent = "Save to Google Drive";
  button.setAttribute(
    "style",
    "position: fixed; bottom: 20px; right: 150px; z-index: 1000;"
  );

  // Add event listener for click
  button.addEventListener("click", function () {
    sendExcalidrawDataToBackground(); // Your function to send data
  });

  document.body.appendChild(button);
};
const injectLoadButton = () => {
  const loadButton = document.createElement("button");
  loadButton.textContent = "Load from Google Drive";
  loadButton.setAttribute(
    "style",
    "position: fixed; bottom: 20px; right: 400px; z-index: 1000;"
  );

  loadButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "loadDrawing" });
  });

  document.body.appendChild(loadButton);
};
injectSaveButton();
injectLoadButton();
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "loadDrawingData") {
    localStorage.setItem("excalidraw", request.data);
    location.reload(); // Reload the page to see the new drawing
  }
});
