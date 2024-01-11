chrome.runtime.onInstalled.addListener(() => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log("Token:", token);
  });
});
