chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadImage") {
    const { imageUrl, pinId } = message;
    console.log(imageUrl);
    chrome.downloads.download({
      url: imageUrl,
      filename: `${pinId}.jpg`,
    });
  }
});
