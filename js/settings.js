$(function() { Settings.init(); });

var Settings = {
  userSettings: {},

  init: function() {
    this.userSettings = this.getAllUserSettings();
    this.delegateEvents();
  },

  delegateEvents: function() {
    this.addSaveListener("#show-ids", "showIds");
    this.addSaveListener("#copy-ids", "copyIds");
    this.loadUserSettings();
  },

  addSaveListener: function(elem, key) {
    var $elem = $(elem),
        storage = chrome.storage.local;

    $elem.on("change", this, function() {
      var val = $(this).is(":checked"),
          jsonKey = key;

      localStorage[jsonKey] = val;
    });
  },

  // Need to refactor for a better programatic way of doing this.
  loadUserSettings: function() {
    if(this.userSettings.showIds === "true") $("input[name='showIds']").prop("checked", true);
    if(this.userSettings.copyIds === "true") $("input[name='copyIds']").prop("checked", true);
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
};