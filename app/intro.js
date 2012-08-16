onload = function() {
  var feedUrlNode = document.getElementById('feed-url');
  feedUrlNode.focus();

  document.getElementById('intent-form').onsubmit = function(event) {
    var feedUrl = feedUrlNode.value;

    var intent = new WebKitIntent({
      action: 'http://webintents.org/view',
      type: 'application/atom+xml',
      data: feedUrl,
      // Use an explicit intent so that we don't trigger the picker, and instead
      // we handle it directly.
      service: location.protocol + '//' + location.hostname + '/main.html'
    });

    window.navigator.webkitStartActivity(intent);

    event.preventDefault();
  };
}
