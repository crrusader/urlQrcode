chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    chrome.cookies.getAll({
      url: request.url
    }, function (cks) {
      let cookie = cks.map((item) => {
        return item.name + "=" + item.value
      }).join(";") + ";";
      sendResponse(cookie);
    });
  }
);