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
      this.showUserStoryIds();
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

  showUserStoryIds: function() {
    var $userStories = $(".taskboard-parent[id*='taskboard']");

    $userStories.each(function() {
      var $this = $(this),
          storyId = App.getUserStoryId($this);

      if(!$this.find(".tfs-enhanced-id").length) $this.find(".witTitle ").prepend("<span class='tfs-enhanced-id'>" + storyId + ": </span>");
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
      if(request == "getCurrentId") {
        if(/taskboard-parent/.test(App.curElement.prop("class"))) {
          sendResponse({workItemId: App.getUserStoryId(App.curElement)});
        } else {
          sendResponse({workItemId: App.getWorkItemId(App.curElement)});
        }
      }
    });
  },

  trackCurrentElement: function() {
    $("body").on("mousedown", this, function(e) {
      App.curElement = $(e.target).parents(".taskboard-parent").length ? $(e.target).parents(".taskboard-parent") : $(e.target).parents(".tbTile");
    });
  },

  getWorkItemId: function($workItem) {
    var taskIdText = $workItem.prop("id"),
        taskId = taskIdText.slice(taskIdText.indexOf("-") + 1, 10);
    
    return taskId;
  },

  getUserStoryId: function($userStory) {
    var storyIdText = $userStory.prop("id"),
        storyId = storyIdText.slice(storyIdText.indexOf("p") + 1, 23);

    return storyId;
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