# Chrome TFS 

A chrome extension to add simple enhancements to the TFS web portal.

### Installation
---

Using Chrome, [click here](https://github.com/jonlunsford/chrome-tfs/blob/master/chrome-tfs.crx?raw=true) to download the `chrome-tfs.crx` file, navigate to the extensions pane in Chrome (you can also paste `chrome://extensions/` into your address bar), then drag and drop the `chrome-tfs.crx` file into the extensions pane.

### Usage
---
Click on the new TFS icon in your browser, enable the settings you would like. The TFS portal MUST be refreshed for the settings to take effect.

#### Board Enhancements
These options will only affect the TFS board.

| Option                | Description                                                                                |
|:----------------------|:-------------------------------------------------------------------------------------------|
| Show work item ID's   | Display ID on the task cards and next to the user story title.                             |
| Enable ID copying     | Right click card or user story to copy ID.                                                 |
| Enable ID link        | Makes the work item ID a link on hover, clicking it will open the work item in a new tab.  |
| Enable Auto Refresh   | Refresh the page at the interval you specify, in milliseconds.                             |

## Contributing
---
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request