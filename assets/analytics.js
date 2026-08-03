(function () {
  'use strict';

  var measurementId = 'G-XNN7PG6C6D';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });
  window.gtag('set', 'ads_data_redaction', true);

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  function eventLabel(link) {
    return (link.textContent || link.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  }

  function sendEvent(name, parameters) {
    window.gtag('event', name, parameters || {});
  }

  window.mettaTrack = sendEvent;

  function trackLink(link) {
    var url;
    try { url = new URL(link.href, window.location.href); } catch (error) { return; }

    var label = eventLabel(link);
    var extensionMatch = url.pathname.match(/\.([a-z0-9]{2,5})$/i);
    var extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

    if (link.hasAttribute('download') || /^(pdf|epub|mp3)$/.test(extension)) {
      sendEvent('metta_download', { file_type: extension || 'file', link_text: label });
      return;
    }

    if (url.origin === window.location.origin && /\/read\/?$/.test(url.pathname)) {
      sendEvent('metta_read_open', { link_text: label });
      return;
    }

    if (/youtube\.com$/.test(url.hostname) || /youtu\.be$/.test(url.hostname)) {
      if (link.closest('#guided-meditations')) {
        var collection = link.closest('.video-collection');
        var collectionTitle = collection && collection.querySelector('h3');
        sendEvent('metta_meditation_open', {
          collection: collectionTitle ? collectionTitle.textContent.trim().slice(0, 60) : 'guided meditation',
          duration: label
        });
      } else {
        sendEvent('metta_audiobook_open', { link_text: label });
      }
      return;
    }

    if (/stripe\.com$/.test(url.hostname)) {
      sendEvent('metta_donation_open', { link_text: label });
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (link) trackLink(link);
  });

  document.addEventListener('play', function (event) {
    if (!event.target.matches('audio') || event.target.dataset.analyticsPlayed === 'true') return;
    event.target.dataset.analyticsPlayed = 'true';
    sendEvent('metta_audiobook_play');
  }, true);
})();
