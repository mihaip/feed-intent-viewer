onload = function() {
  document.getElementById('controls').onsubmit = function(event) {
    event.preventDefault();

    document.querySelector('#xml-viewer').innerHTML = '';
    hideMessage('loading-error');
    hideMessage('reader-error');

    // We can't use explicit intent dispatch since that opens yet another
    // window.
    handleUrl(document.getElementById('url').value);
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
    if (!localStorage.lastLoadWasBlob || localStorage.lastLoadedBlobUrl != url) {
      localStorage.lastLoadWasBlob = true;
      localStorage.lastLoadedBlobUrl = url;
      handleBlob(intent.data, url);
      return;
    }
  } else {
    delete localStorage.lastLoadWasBlob;
    delete localStorage.lastLoadedBlobUrl;
  }

  var url = (intent.getExtra && intent.getExtra('url')) || intent.data;

  if (url.indexOf('http') != 0 || url.indexOf('/') == -1) {
    showMessage('url-error', url);
    return;
  }

  handleUrl(url);
}

function handleUrl(url) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/xml');
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status >= 400) {
      showMessage('loading-error', url);
      return;
    }
    handleBlob(xhr.response, url);
  };
  xhr.onerror = function() {
    showMessage('loading-error', url);
  };
  xhr.open('GET', url, true);

  xhr.send();
}

function handleBlob(inputBlob, sourceUrl) {
  beginLoading();
  document.getElementById('url').value = sourceUrl;

  var reader = new FileReader();
  reader.onload = function() {
    var feedText = reader.result;
    feedText = feedText.replace(/<\?xml-stylesheet\s+[^?>]*\?>/g, '');

    // TODO(mihaip): handle parse errors.
    var feedDocument = new DOMParser().parseFromString(feedText, 'text/xml');

    doneLoading();
    appendXmlViewer(feedDocument, document.querySelector('#xml-viewer'));
  }

  reader.onerror = function() {
    doneLoading();
    showMessage('reader-error', reader.error.name);
  }

  reader.readAsText(inputBlob);
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
