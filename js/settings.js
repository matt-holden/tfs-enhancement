$(function() { Settings.init(); });

var Settings = {
  userSettings: {},

  init: function() {
    this.userSettings = this.getAllUserSettings();
    this.delegateEvents();
  },

  delegateEvents: function() {
    this.addSaveListener("#show-ids", "showIds", "change");
    this.addSaveListener("#skip-to-dev-cycle-notes", "skipToDevCycleNotes", "change");
    this.addSaveListener("#copy-ids", "copyIds", "change");
    this.addSaveListener("#copy-ids", "copyIds", "change");
    this.addSaveListener("#auto-refresh", "autoRefresh", "change");
    this.addSaveListener("#auto-refresh-time", "autoRefreshTime", "keyup");
    this.addSaveListener("#enable-link", "enableLink", "change");
    this.addSaveListener("#enable-name-highlight", "enableNameHighlight", "change");
    this.addSaveListener("#name-highlight-text-input", "nameHighlightUsername", "keyup");
    this.addSaveListener("#name-highlight-select", "nameHighlightColor", "change");
    this.validateUserSettings();
    this.loadUserSettings();
  },

  addSaveListener: function(elem, key, event) {
    var that = this;
    var $elem = $(elem),
        storage = chrome.storage.local;

    $elem.on(event, this, function(e) {
      var val = e.target.type === "checkbox" ? $(this).is(":checked") : $(this).val(),
          jsonKey = key;

      localStorage[jsonKey] = val;
    });
  },

  // Add any precautionary adjustments here
  validateUserSettings: function() {
    if (this.userSettings.nameHighlightColor !== undefined) {
      // If the user color isn't in a valid format, we'll unset it entirely
      var rgbRegExp = /rgb\((\d+),(\d+),(\d+)\)/;
      if (!this.userSettings.nameHighlightColor.match(rgbRegExp)) {
        this.userSettings.nameHighlightColor = localStorage['nameHighlightColor'] = "";
      }
    }
  },

  // Need to refactor for a better programatic way of doing this.
  loadUserSettings: function() {
    if(this.userSettings.showIds === "true") $("input[name='showIds']").prop("checked", true);
    if(this.userSettings.skipToDevCycleNotes === "true") $("input[name='skipToDevCycleNotes']").prop("checked", true);
    if(this.userSettings.copyIds === "true") $("input[name='copyIds']").prop("checked", true);
    if(this.userSettings.autoRefresh === "true") $("input[name='autoRefresh']").prop("checked", true);
    if(this.userSettings.autoRefreshTime) $("input[name='autoRefreshTime']").val(this.userSettings.autoRefreshTime);
    if(this.userSettings.enableLink === "true") $("input[name='enableLink']").prop("checked", true);
    if(this.userSettings.enableNameHighlight === "true") $("input[name='enableNameHighlight']").prop("checked", true);
    if(this.userSettings.nameHighlightUsername.length) $("input[name='nameHighlightUsername']").val(this.userSettings.nameHighlightUsername);
    if(this.userSettings.nameHighlightColor.length) $("select[name='nameHighlightColor']").val(this.userSettings.nameHighlightColor);

  },

  getAllUserSettings: function() {
    var settings = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i),
          value = localStorage[key];

      settings[key] = value;
    }
    return settings;
  }
};
