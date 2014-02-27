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

    if(App.userSettings.enableLink === "true") {
      this.attachOverlay();
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
      
      if(App.userSettings.enableLink === "true") { 
        App.attachOverlay();
      }
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
  },

  attachOverlay: function() {
    var $taskCards = $('.tbTile');

    $taskCards.each(function(){
      var $this = $(this),
          $thisContent = $this.find('.tbTileContent'),
          myID = $this.attr('id').split('-')[1];
      $this.attr('title', myID);
    });

    $taskCards.on("mouseover", this, function() {
      var $this = $(this),
          myID = $this.attr('title'),
          $myDiv = $(this).find('.JPS-QuickLink');
      if(!$myDiv || $myDiv.length === 0) {
        $this.append('<div class="JPS-QuickLink" style="position:relative; top:-80px; left:10px; width:50px; padding:0 4px; z-index:1000; background-color:white; box-shadow: 0px 1px 10px 1px gray; border-radius:2px;"><a href="http://tfssrv0101:8080/tfs/MBCollection/mb/_workitems#_a=edit&id=' + myID + '" target="_blank">' + myID + '</a></div>');
      }
    });

    $taskCards.on("mouseout", this, function(e) {
      var $myDiv = $(this).find('.JPS-QuickLink');
      if($myDiv.is(':hover') === false) $myDiv.remove();
    });
  }

};