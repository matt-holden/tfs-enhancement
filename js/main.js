$(function() { App.init(); });

var App = {
  curElement: "",
  userSettings: {},
  workItemModalAppearanceEventListeners: {
    'show' : [],
    'hide' : []
  },
  rgbRegExp: /rgb\((\d+),(\d+),(\d+)\)/, //Caching this regexp for performance


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

    this.initWorkItemModalWatcher();

    if(App.userSettings.skipToDevCycleNotes === "true") {
      this.initSkipToDevCycleNotes();
    }

    if(App.userSettings.enableNameHighlight === "true" && App.userSettings.nameHighlightUsername !== undefined && App.userSettings.nameHighlightColor !== undefined) {
      this.initNameHighlighting();
    }

    this.initSessionTracking();
    this.initScrollTopOffsetTracking();
    this.scrollToStoredScrollTopOffset();

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
      else if (request == "getCurrentTitle") {
          if (/taskboard-parent/.test(App.curElement.prop("class"))) {
              sendResponse({ workItemTitle: App.getUserStoryTitle(App.curElement) });
          } else {
              sendResponse({ workItemTitle: App.getWorkItemTitle(App.curElement) });
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
        taskId = taskIdText.slice(taskIdText.indexOf("-") + 1);

    return taskId;
  },

  getUserStoryId: function($userStory) {
    var storyIdText = $userStory.prop("id"),
        storyId = storyIdText.slice(storyIdText.indexOf("p") + 1, 23);

    return storyId;
  },

  getWorkItemTitle: function ($workItem) {
      var itemBackgroundColor = $workItem.find('.tbTileContent').css("backgroundColor"),
          itemType = ((itemBackgroundColor == "rgb(230, 244, 220)") ? "Bug " : (itemBackgroundColor == "rgb(212, 220, 246)") ? "Task " : "? "),
          itemTitle = itemType + $workItem.find('.witTitle').text();

      return itemTitle;
  },

  getUserStoryTitle: function ($userStory) {
      var storyTitle = "User Story " + $userStory.find('.witTitle').text();

      return storyTitle;
  },

  getUserSettings: function() {
    chrome.runtime.sendMessage({method: "getUserSettings"}, function(response) {
      App.userSettings = response;
      App.delegateEvents();
    });
  },

  initAutoRefresh: function(interval) {
    setTimeout(App.refreshPageIfSafe, interval);
  },

  refreshPageIfSafe: function() {
    // A .workitem-dialog div exists while a user-input popover is presented.
    if ($('div.workitem-dialog').length) {
      var retryTimeout = 5 * 1000;
      setTimeout(App.refreshPageIfSafe, retryTimeout);
    } else {
      window.location.reload();
    }
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
          $myDiv = $this.find('.JPS-QuickLink');

      if (!$myDiv || $myDiv.length === 0) {
        var copyTitleOnRightClick = 'title = "' + App.getWorkItemTitle($this) + '" ';
        $this.append('<div class="JPS-QuickLink" style="position:relative; top:-80px; left:10px; width:50px; padding:0 4px; z-index:1000; background-color:white; box-shadow: 0px 1px 10px 1px gray; border-radius:2px;"><a class="copyWorkItemTitle" href="http://tfssrv0101:8080/tfs/MBCollection/mb/_workitems#_a=edit&id=' + myID + '" ' + copyTitleOnRightClick + ' target="_blank">' + myID + '</a></div>');
      }
    });

    $(".copyWorkItemTitle").on("contextmenu", this, function () {
      var myTitle = $(this).attr('title');
      chrome.runtime.sendMessage({method: "copyToClipboard", text:myTitle});
      return false;
    });

    $taskCards.on("mouseout", this, function(e) {
      var $myDiv = $(this).find('.JPS-QuickLink');
      if($myDiv.is(':hover') === false) $myDiv.remove();
    });
  },

  initSessionTracking: function() {
    var kSessionFragment = "extensionSession=1";
    var currentHash = window.location.hash;
    var activeSessionRegExp = new RegExp(kSessionFragment);

    // Nothing to do, we're mid-sesison
    if (currentHash.match(activeSessionRegExp))
        return;

    // New session
    delete localStorage.lastScrollTopOffset;

    var newHash = "";
    if (currentHash.length === 0) {
      newHash = kSessionFragment;
    } else {
      newHash = currentHash + "&" + kSessionFragment;
    }

    window.location.hash = newHash;
  },

  initScrollTopOffsetTracking: function() {
    $('#taskboard').scroll(function() {
      localStorage.lastScrollTopOffset = $('#taskboard').scrollTop();
    });
  },

  initWorkItemModalWatcher: function() {
    var that = this;

    var lastValue = null;
    var checkVisibility = function () {

      // Using querySelector() stops the DOM traversal the moment
      // the first match is found, rather than seeking multiple matches on
      // for the selector.
      // By looking for the child element 'table.witform-layout', we are waiting until
      // the modal content's have loaded (via AJAX) before invoking callback handlers.
      var modalElement = document.querySelector('div.workitem-dialog table.witform-layout');
      var visible = !! modalElement;

      if (visible !== lastValue) {
        lastValue = visible;

        var eventName = visible ? "show" : "hide";
        var fns = that.workItemModalAppearanceEventListeners[eventName];
        setTimeout(function (){
          for (var i = 0, len = fns.length; i < len; i++) {
              fns[i].call(that, modalElement);
          }
        }, 0);
      }
    };
    setInterval(function () {
      checkVisibility();
    }, 20);
  },

  initSkipToDevCycleNotes: function () {
    if(App.userSettings.skipToDevCycleNotes === "true") {
      this.addWorkItemModalAppearanceEventListener("show", function (modalElement) {
        $('a[rawtitle="Dev Cycle Notes"]')[0].click();
        setTimeout(function(){
          // Scroll to bottom of cycle notes... sexily.
          var scrollingArea = $('.work-item-view');
          if (scrollingArea.length) { // sanity check
            scrollingArea.animate({ scrollTop: scrollingArea[0].scrollHeight}, 1000);
          }
        }, 0);
      });
    }
  },

  initNameHighlighting: function () {
    var iRef; // timer interval reference

    // Check for coloring whenever the assignee is edited
    $('#taskboard').on('DOMSubtreeModified', 'div.tbTile .tbTileContent .witAssignedTo', function (evt) {
      var tile = $(this).parents('.tbTileContent')[0];
      // The stuff that TFS does to the DOM is very wonky and hard to figure out,
      // so we're just gonna re-apply colorization across the board every 3 seconds
      // for 12 seconds (to make sure the AJAX save has finished and the DOM is
      // back in sound state)
      // It's very scientific....
      if (iRef) clearInterval(iRef);

      setTimeout(function(){
        clearInterval(iRef);
      }, 12000);

      iRef = setInterval(function(){
        App.applyNameHighlightingForAllTiles();
      }, 3000);

    });

    App.applyNameHighlightingForAllTiles();
  },

  applyNameHighlightingForAllTiles: function () {
    // Iterate through all tiles, store their current color values,
    // and apply highllighting whenever matches occur
    var allTiles = $('#taskboard-table div.tbTile .tbTileContent').each(function(i, el){
      // First store current background-color and border-left-color values
      var $el = $(el);
      $el.data('originalBackgroundColor', el.style.backgroundColor);
      $el.data('originalBorderLeftColor', el.style.borderLeftColor);
      $el.find('.witAssignedTo').data('originalAssigneeTextColor', el.style.borderLeftColor);

      // Apply name highlighting to matches
      App.toggleNameHighlightingForTile(el);
    });
  },

  toggleNameHighlightingForTile: function (tile) {

    var username = App.userSettings.nameHighlightUsername;
    var userColor = App.userSettings.nameHighlightColor;
    var regExp = new RegExp(username);
    var assigneeEl = $('.witAssignedTo .onTileEditTextDiv', tile).get(0);

    var isUserMatch = assigneeEl && regExp.test(assigneeEl.textContent);
    if (isUserMatch && userColor && (colorMatch = userColor.match(App.rgbRegExp))) {
      tile.style.backgroundColor = userColor;
      tile.style.borderLeftColor = App.util.rgbOffsetBy(userColor, -20);
      assigneeEl.style.color = App.util.rgbOffsetBy(userColor, -110);
      $(assigneeEl).data('hasHighlightModifications', true);
    }
    else if ($(assigneeEl).data('hasHighlightModifications') === true) {
      tile.style.borderLeftColor = $(tile).data('originalBorderLeftColor');
      tile.style.backgroundColor = $(tile).data('originalBackgroundColor');

      if (assigneeEl)
        assigneeEl.style.color = $(tile).data('originalAssigneeTextColor');

      $(assigneeEl).data('hasHighlightModifications', false);
    }
  },

  // Events are "show", "hide"
  // Callbacks will be executed in the context of this object
  addWorkItemModalAppearanceEventListener: function (evt, callback) {
    this.workItemModalAppearanceEventListeners[evt].push(callback);
  },


  scrollToStoredScrollTopOffset: function() {
    var offset = parseInt(localStorage.lastScrollTopOffset);

    if (offset > 0) {
      $('#taskboard').scrollTop(localStorage.lastScrollTopOffset);
    }
  },

  util: {
    // Utility method for my bad understanding of color math
    rgbOffsetBy : function (color, offset) {
      var colorMatch = color.match(App.rgbRegExp);
      if (!colorMatch) {
        throw "color: " + color + " ain't no color";
      }
      var colorParts = [
        parseInt(colorMatch[1]) + offset,
        parseInt(colorMatch[2]) + offset,
        parseInt(colorMatch[3]) + offset
      ];
      return 'rgb(' + colorParts.join(',') + ')';
    }
  }
};
