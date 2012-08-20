var URL_PARAM_PREFIX = '?url=';

onload = function() {
  document.getElementById('controls').onsubmit = function(event) {
    document.querySelector('#xml-viewer').innerHTML = '';
    hideMessage('loading-error');
    hideMessage('reader-error');

    // We let the form submit, so that the feed URL ends up in the location, and
    // we can then pick it up on reload.
  }

  // Form parameters trump intents.
  if (location.search.indexOf(URL_PARAM_PREFIX) == 0) {
    var url = decodeURIComponent(
        location.search.substring(URL_PARAM_PREFIX.length));
    handleUrl(url);
    return;
  }

  var intent = window.webkitIntent;
  if (!intent) {
    location.href = 'intro.html'
    return;
  }

  // The intent dispatched by Chrome's download manager includes the downloaded
  // bytes as a Blob (see ChromeDownloadManagerDelegate::OpenWithWebIntent) so
  // we don't need to fech the data ourselves.
  if (intent.data instanceof Blob) {
    var url = intent.getExtra('url');

    // To handle the case where the use reloads the page and expects to see
    // updated feed data, we only use the blob data for a given URL once.
    if (!sessionStorage.lastLoadWasBlob ||
        sessionStorage.lastLoadedBlobUrl != url) {
      sessionStorage.lastLoadWasBlob = true;
      sessionStorage.lastLoadedBlobUrl = url;
      handleBlob(intent.data, url);
      return;
    }
  } else {
    delete sessionStorage.lastLoadWasBlob;
    delete sessionStorage.lastLoadedBlobUrl;
  }

  var url = (intent.getExtra && intent.getExtra('url')) || intent.data;
  handleUrl(url);
}

function handleUrl(url) {
  init(url);
  if (url.indexOf('http') != 0 || url.indexOf('/') == -1) {
    showMessage('url-error', url);
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/xml');
  xhr.responseType = 'text';
  xhr.onload = function() {
    if (xhr.status >= 400) {
      showMessage('loading-error', url);
      doneLoading();
      return;
    }
    handleText(xhr.response, url);
  };
  xhr.onerror = function() {
    showMessage('loading-error', url);
    doneLoading();
  };
  xhr.open('GET', url, true);

  xhr.send();
}

function handleBlob(inputBlob, sourceUrl) {
  init(sourceUrl);

  var reader = new FileReader();
  reader.onload = function() {
    handleText(reader.result);
  }

  reader.onerror = function() {
    doneLoading();
    showMessage('reader-error', reader.error.name);
  }

  reader.readAsText(inputBlob);
}

function handleText(feedText, sourceUrl) {
  feedText = feedText.replace(/<\?xml-stylesheet\s+[^?>]*\?>/g, '');

  // TODO(mihaip): handle parse errors.
  var feedDocument = new DOMParser().parseFromString(feedText, 'text/xml');

  doneLoading();
  appendXmlViewer(feedDocument, document.querySelector('#xml-viewer'));
}

function init(url) {
  beginLoading();
  document.getElementById('url').value = url;
  document.getElementById('permalink').href = '?url=' + encodeURIComponent(url);
}

function beginLoading() {
  var buttonNode = document.querySelector('input[type="submit"]');
  buttonNode.disabled = true;
  buttonNode.value = 'Loading...';
}

function doneLoading() {
  var buttonNode = document.querySelector('input[type="submit"]');
  buttonNode.disabled = false;
  buttonNode.value = 'Load';
}

function showMessage(id, data) {
  document.getElementById(id + '-data').textContent = data;
  document.getElementById(id).style.display = '';
}

function hideMessage(id) {
  document.getElementById(id).style.display = 'none';
}
