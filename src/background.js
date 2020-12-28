var endInterval = () => {
  chrome.browserAction.setBadgeText({
    text: ""
  });
};
endInterval()