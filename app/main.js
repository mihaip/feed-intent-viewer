onload = function() {
  var intent = window.webkitIntent;
  if (!intent) {
    location.href = 'intro.html'
    return;
  }

  // The intent dispatched by Chrome's download manager includes the downloaded
  // bytes as a Blob (see ChromeDownloadManagerDelegate::OpenWithWebIntent) so
  // we don't need to fech the data ourselves.
  if (intent.data instanceof Blob) {
    handleBlob(intent.data, intent.getExtra && intent.getExtra('url'));
    return;
  }

  var url = (intent.getExtra && intent.getExtra('url')) || intent.data;

  if (url.indexOf('http') != 0 || url.indexOf('/') == -1) {
    showMessage('url-error', url);
    return;
  }

  showMessage('loading', url);

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/xml');
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status >= 400) {
      hideMessage('loading');
      showMessage('loading-error', url);
      return;
    }
    handleBlob(xhr.response, url);
  };
  xhr.onerror = function() {
    hideMessage('loading');
    showMessage('loading-error', url);
  };
  xhr.open('GET', url, true);

  xhr.send();
}

function handleBlob(inputBlob, sourceUrl) {
  var reader = new FileReader();
  reader.onload = function() {
    var feedText = reader.result;
    feedText = feedText.replace(/<\?xml-stylesheet\s+[^?>]*\?>/g, '');

    var feedParser = new DOMParser();
    var feedDocument = new DOMParser().parseFromString(feedText, 'text/xml');

    var xmlViewerNode = document.createElement('div');
    document.body.appendChild(xmlViewerNode);

    hideMessage('loading');

    appendXmlViewer(feedDocument, xmlViewerNode);
  }

  reader.onerror = function() {
    hideMessage('loading');
    showMessage('reader-error', reader.error.name);
  }

  reader.readAsText(inputBlob);
}

function showMessage(id, data) {
  document.getElementById(id + '-data').textContent = data;
  document.getElementById(id).style.display = '';
}

function hideMessage(id) {
  document.getElementById(id).style.display = 'none';
}
