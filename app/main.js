onload = function() {
  var intent = window.webkitIntent;
  if (!intent) {
    // TODO(mihaip): show landing page
    return;
  }

  if (intent.data instanceof Blob) {
    handleBlob(intent.data);
    return;
  }

  var url = intent.data || intent.getExtra('url');

  // TODO(mihaip): validate URL

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/xml');
  xhr.responseType = 'blob';
  xhr.onload = function() {
    handleBlob(xhr.response);
  };
  xhr.onerror = function() {
    // TODO(mihaip)
  };
  xhr.open('GET', url, true);

  // TODO(mihaip): show progress
  xhr.send();
}

function handleBlob(inputBlob) {
  var reader = new FileReader();
  reader.onload = function() {
    var feedText = reader.result;
    feedText = feedText.replace(/<\?xml-stylesheet\s+[^?>]*\?>/g, '');

    var blobBuilder = new WebKitBlobBuilder();
    blobBuilder.append(feedText);
    var displayBlob = blobBuilder.getBlob('text/xml');
    location.href = webkitURL.createObjectURL(displayBlob);
  }

  // TODO(mihaip): handle FileReader errors
  reader.readAsText(inputBlob);
}