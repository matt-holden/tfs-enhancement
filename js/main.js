$(function() { App.init(); });

var App = {
  curElement: "",
  userSettings: {},
  
  init: function() {
    this.getUserSettings();
  },

  delegateEvents: function() {
    if(App.userSettings.showIds === "true") {
      this.showTaskIds();
      this.updateCardsAfterClose();
      this.trackCurrentElement();
    }

    if(App.userSettings.autoRefresh === "true" && App.userSettings.autoRefreshTime) {
      this.initAutoRefresh(App.userSettings.autoRefreshTime);
    }
    this.initBackgroundCommunications();
  },

  showTaskIds: function() {
    var $taskCards = $(".tbTile");
    
    $taskCards.each(function() {
      var $this = $(this),
          taskId = App.getWorkItemId($this);

      if(!$this.find(".tfs-enhanced-id").length) $this.find(".witTitle ").prepend("<span class='tfs-enhanced-id'>" + taskId + ": </span>");
    });
  },

  updateCardsAfterClose: function() {
   var $taskCards = $(".tbTile");

   $taskCards.on("focus", this, function() {
      App.showTaskIds();
   });
  },

  initBackgroundCommunications: function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if(request == "getCurrentId") sendResponse({workItemId: App.getWorkItemId(App.curElement)});
    });
  },

  trackCurrentElement: function() {
    $("body").on("mousedown", this, function(e) {
      App.curElement = $(e.target).parents(".tbTile");
    });
  },

  getWorkItemId: function($workItem) {
    var taskIdText = $workItem.prop("id"),
        taskId = taskIdText.slice(taskIdText.indexOf("-") + 1, 10);
    
    return taskId;
  },

  getUserSettings: function() {
    chrome.runtime.sendMessage({method: "getUserSettings"}, function(response) {
      App.userSettings = response;
      App.delegateEvents();
    });
  },

  initAutoRefresh: function(interval) {
    setTimeout(function() { window.location.reload(); }, interval);
  }
};