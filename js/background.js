$(function() { App.init(); });

var App = {
  userSettings: {},
  
  init: function() {
    this.userSettings = App.getAllUserSettings();
    this.delegateEvents();
  },

  delegateEvents: function() {
    this.sendUserSettings();
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
    if(settings.copyIds === "true") chrome.contextMenus.create({"title": "Copy work item ID", "onclick":App.copyWorkId});
  },

  copyWorkId: function() {
    App.sendMessage("getCurrentId", App.copyToClipboard, "workItemId");
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
      if(/tfs:8080/.test(tab[0].url)) {
        chrome.tabs.sendMessage(tab[0].id, method, function(response) {
          callback(response[key]);
        });
      } else {
        alert("To use TFS enhancements you must be on the TFS tab.");
      }
    });
  }
};