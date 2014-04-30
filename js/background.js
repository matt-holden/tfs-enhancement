$(function() { App.init(); });

var App = {
  userSettings: {},
  
  init: function() {
    this.userSettings = App.getAllUserSettings();
    this.delegateEvents();
  },

  delegateEvents: function() {
    this.sendUserSettings();
    this.receiveCopyToClipboard();
    this.buildContextMenu();
  },

  sendUserSettings: function() {
    chrome.runtime.onMessage.addListener( function (message,sender,sendResponse) {
      if(message.method == 'getUserSettings') {
        sendResponse(App.getAllUserSettings());
        chrome.contextMenus.removeAll();
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
    var settings = App.getAllUserSettings();
    if (settings.copyIds === "true") chrome.contextMenus.create({ "title": "Copy work item ID", "onclick": App.copyWorkId });
    chrome.contextMenus.create({ "title": "Copy work item title", "onclick": App.copyWorkTitle });
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
    chrome.tabs.getSelected(function(tab) {
      if(/tfs:8080/.test(tab.url) || /tfs.mindbodyonline.com/.test(tab.url)) {
        chrome.tabs.sendMessage(tab.id, method, function(response) {
          callback(response[key]);
        });
      } else {
        alert("To use TFS enhancements you must be on the TFS tab.");
      }
    });
  }
};