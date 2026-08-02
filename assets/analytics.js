(function () {
  'use strict';

  var measurementId = 'G-BZ0NFQ7RGF';
  var storageKey = 'metta-analytics-consent-v1';
  var googleTagLoaded = false;
  var consentBanner = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });
  window.gtag('set', 'ads_data_redaction', true);

  function readChoice() {
    try { return window.localStorage.getItem(storageKey); } catch (error) { return null; }
  }

  function writeChoice(choice) {
    try { window.localStorage.setItem(storageKey, choice); } catch (error) {}
  }

  function analyticsAllowed() { return readChoice() === 'granted'; }

  function updateConsent(granted) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function loadGoogleTag() {
    if (googleTagLoaded) return;
    googleTagLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; Path=/; Domain=.' + window.location.hostname + '; SameSite=Lax';
    });
  }

  function removeBanner() {
    if (consentBanner) consentBanner.remove();
    consentBanner = null;
  }

  function grantAnalytics() {
    writeChoice('granted');
    updateConsent(true);
    loadGoogleTag();
    removeBanner();
  }

  function declineAnalytics() {
    writeChoice('denied');
    updateConsent(false);
    clearAnalyticsCookies();
    removeBanner();
  }

  function showConsentBanner() {
    if (consentBanner && consentBanner.isConnected) return;

    consentBanner = document.createElement('section');
    consentBanner.className = 'analytics-consent';
    consentBanner.setAttribute('aria-label', 'Analytics choices');
    consentBanner.innerHTML =
      '<p><strong>Help improve the free site.</strong>' +
      'Allow Google Analytics so I can learn which books, audio, and practices people actually use. ' +
      'No advertising, and no names, email addresses, or review text are sent.</p>' +
      '<div class="analytics-consent-actions">' +
      '<button class="analytics-consent-allow" type="button">Allow analytics</button>' +
      '<button class="analytics-consent-decline" type="button">No thanks</button>' +
      '<a href="/privacy/">Privacy details</a>' +
      '</div>';

    consentBanner.querySelector('.analytics-consent-allow').addEventListener('click', grantAnalytics);
    consentBanner.querySelector('.analytics-consent-decline').addEventListener('click', declineAnalytics);
    document.body.appendChild(consentBanner);
  }

  function scheduleConsentBanner() {
    var welcomeDialog = document.getElementById('welcome-dialog');
    if (!welcomeDialog) {
      window.setTimeout(showConsentBanner, 600);
      return;
    }

    var welcomeSeen = false;
    try { welcomeSeen = window.localStorage.getItem('metta-welcome-review-20260802b') === 'seen'; } catch (error) {}

    if (welcomeSeen) {
      window.setTimeout(showConsentBanner, 700);
      return;
    }

    window.setTimeout(function () {
      if (welcomeDialog.open) {
        welcomeDialog.addEventListener('close', showConsentBanner, { once: true });
      } else {
        showConsentBanner();
      }
    }, 7000);
  }

  function eventLabel(link) {
    return (link.textContent || link.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  }

  function sendEvent(name, parameters) {
    if (!analyticsAllowed() || !googleTagLoaded) return;
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
    var settingsButton = event.target.closest('[data-analytics-settings]');
    if (settingsButton) {
      showConsentBanner();
      return;
    }

    var link = event.target.closest('a[href]');
    if (link) trackLink(link);
  });

  document.addEventListener('play', function (event) {
    if (!event.target.matches('audio') || event.target.dataset.analyticsPlayed === 'true' || !analyticsAllowed()) return;
    event.target.dataset.analyticsPlayed = 'true';
    sendEvent('metta_audiobook_play');
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    if (analyticsAllowed()) {
      updateConsent(true);
      loadGoogleTag();
    } else if (readChoice() !== 'denied') {
      scheduleConsentBanner();
    }
  });
})();
