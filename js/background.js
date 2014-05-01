$(function() { App.init(); });

var App = {
  userSettings: {},

  init: function() {
    this.userSettings = App.getAllUserSettings();
    this.checkTabChange();
  },

  validateTFSUrl: function(url) {
    if (App.userSettings.tfsUrls) {
      var arr = App.userSettings.tfsUrls.split(',');
      var len = arr.length;
      for (var i = 0; i < len; i++) {
        var regex = new RegExp(arr[i]);
        if (regex.test(url))
          return true;
      }
    }
    return false;
  },

  checkTabChange: function() {
    chrome.tabs.onActivated.addListener(function(activeInfo) {
      App.userSettings = App.getAllUserSettings(); // needs to be better...?
      if (App.userSettings.tfsUrls) {
        chrome.tabs.get(activeInfo.tabId, function(tab) {
          debugger;
          var tfs = App.validateTFSUrl(tab.url);
          if (tfs) {
            chrome.tabs.executeScript(activeInfo.tabId, { file: 'js/main.js' }, null);
            App.delegateEvents();
            App.buildContextMenu();
          } else {
            App.destroyContextMenu();
          }
        });
      }
    });
  },

  delegateEvents: function() {
    this.sendUserSettings();
    this.receiveCopyToClipboard();
  },

  sendUserSettings: function() {
    chrome.runtime.onMessage.addListener(function (message,sender,sendResponse) {
      if(message.method == 'getUserSettings') {
        sendResponse(App.getAllUserSettings());
        App.buildContextMenu();
      }
    });
  },

  receiveCopyToClipboard: function () {
      chrome.runtime.onMessage.addListener(function (message,sender,sendResponse) {
          if (message.method == 'copyToClipboard') {
              App.copyToClipboard(message.text);
          }
      });
  },

  getAllUserSettings: function() {
    var settings = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i),
          value = localStorage[key];

      settings[key] = value;
    }
    return settings;
  },

  buildContextMenu: function() {
    App.destroyContextMenu();
    var settings = App.getAllUserSettings();
    if (settings.copyIds === "true") chrome.contextMenus.create({ "title": "Copy work item ID", "onclick": App.copyWorkId });
    chrome.contextMenus.create({ "title": "Copy work item title", "onclick": App.copyWorkTitle });
  },

  destroyContextMenu: function() {
    chrome.contextMenus.removeAll();
  },

  copyWorkId: function() {
    App.sendMessage("getCurrentId", App.copyToClipboard, "workItemId");
  },

  copyWorkTitle: function () {
    App.sendMessage("getCurrentTitle", App.copyToClipboard, "workItemTitle");
  },

  copyToClipboard: function(text) {
    var $placeholder = $("<textarea/>");
    $placeholder.text(text);
    $("body").append($placeholder);
    $placeholder.select();
    document.execCommand("copy", true);
    $placeholder.remove();
  },

  // Helpers

  sendMessage: function(method, callback, key) {
    chrome.tabs.query({active: true}, function(tab) {
      var tfs = App.validateTFSUrl(tab[0].url);
      if(tfs) {
        chrome.tabs.sendMessage(tab[0].id, method, function(response) {
          callback(response[key]);
        });
      } else {
        alert("To use TFS enhancements you must be on the TFS tab.");
      }
    });
  }
};
