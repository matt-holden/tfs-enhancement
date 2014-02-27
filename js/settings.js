$(function() { Settings.init(); });

var Settings = {
  userSettings: {},

  init: function() {
    this.userSettings = this.getAllUserSettings();
    this.delegateEvents();
  },

  delegateEvents: function() {
    this.addSaveListener("#show-ids", "showIds", "change");
    this.addSaveListener("#copy-ids", "copyIds", "change");
    this.addSaveListener("#copy-ids", "copyIds", "change");
    this.addSaveListener("#auto-refresh", "autoRefresh", "change");
    this.addSaveListener("#auto-refresh-time", "autoRefreshTime", "keyup");
    this.addSaveListener("#enable-link", "enableLink", "change");
    this.loadUserSettings();
  },

  addSaveListener: function(elem, key, event) {
    var $elem = $(elem),
        storage = chrome.storage.local;

    $elem.on(event, this, function(e) {
      var val = e.target.type === "checkbox" ? $(this).is(":checked") : $(this).val(),
          jsonKey = key;

      localStorage[jsonKey] = val;
    });
  },

  // Need to refactor for a better programatic way of doing this.
  loadUserSettings: function() {
    if(this.userSettings.showIds === "true") $("input[name='showIds']").prop("checked", true);
    if(this.userSettings.copyIds === "true") $("input[name='copyIds']").prop("checked", true);
    if(this.userSettings.autoRefresh === "true") $("input[name='autoRefresh']").prop("checked", true);
    if(this.userSettings.autoRefreshTime) $("input[name='autoRefreshTime']").val(this.userSettings.autoRefreshTime);
    if(this.userSettings.enableLink === "true") $("input[name='enableLink']").prop("checked", true);
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