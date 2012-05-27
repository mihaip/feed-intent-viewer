onload = function() {
  var feedUrlNode = document.getElementById('feed-url');
  feedUrlNode.focus();

  document.getElementById('intent-form').onsubmit = function(event) {
    var feedUrl = feedUrlNode.value;

    var intent = new WebKitIntent(
        'http://webintents.org/view', 'application/atom+xml', feedUrl);

    window.navigator.webkitStartActivity(intent);

    event.preventDefault();
  };
}