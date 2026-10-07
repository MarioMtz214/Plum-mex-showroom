/*!
 * Plum-mex: consent, campaign attribution and event tracking.
 *
 * INERT until a Google Tag Manager container ID is set in GTM_ID below.
 *
 * Consent model ("basic"): GTM, and therefore any GA4 / Google Ads / Meta tag
 * configured inside it, is only loaded AFTER the visitor clicks Accept on the
 * cookie banner. Before that nothing is stored or sent to third parties.
 * Campaign parameters (utm_*, gclid, fbclid...) are only kept in sessionStorage
 * after consent; without consent they are read from the current URL only.
 */
(function () {
  'use strict';

  // >>> SET THIS once the GTM container exists, e.g. 'GTM-ABC1234'
  var GTM_ID = '';
  // <<<

  var CONSENT_KEY = 'cookieConsent';      // written by the banner on every page
  var ATTR_KEY = 'pm_attribution';
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];
  var consented = false, gtmLoaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // Everything denied by default
  gtag('consent', 'default', {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500
  });

  function storedConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function hasConsent() { return consented || storedConsent() === 'accepted'; }
  function clip(v) { return String(v).slice(0, 200); }

  function urlParams() {
    var out = {};
    try {
      var q = new URLSearchParams(window.location.search);
      PARAMS.forEach(function (k) { var v = q.get(k); if (v) out[k] = clip(v); });
    } catch (e) {}
    return out;
  }
  function externalReferrer() {
    try {
      if (!document.referrer) return '';
      var r = new URL(document.referrer);
      return r.hostname === window.location.hostname ? '' : clip(r.origin + r.pathname);
    } catch (e) { return ''; }
  }
  function readStored() { try { return JSON.parse(sessionStorage.getItem(ATTR_KEY)) || {}; } catch (e) { return {}; } }
  function writeStored(o) { try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(o)); } catch (e) {} }

  // Keep campaign data for the session (last click wins). Only with consent.
  function persistAttribution() {
    if (!hasConsent()) return;
    var cur = urlParams(), stored = readStored(), ref = externalReferrer();
    if (Object.keys(cur).length) {
      stored = cur; stored.landing_page = clip(window.location.pathname);
      if (ref) stored.referrer = ref;
    } else if (!stored.landing_page) {
      stored.landing_page = clip(window.location.pathname);
      if (ref) stored.referrer = ref;
    }
    writeStored(stored);
  }

  // Attribution object to send with the contact form
  function attribution() {
    var out = {}, stored = hasConsent() ? readStored() : {}, cur = urlParams();
    Object.keys(stored).forEach(function (k) { out[k] = stored[k]; });
    if (Object.keys(cur).length) {
      PARAMS.forEach(function (k) { delete out[k]; });
      Object.keys(cur).forEach(function (k) { out[k] = cur[k]; });
    }
    return out;
  }

  function loadGTM() {
    if (gtmLoaded || !/^GTM-[A-Z0-9]{4,12}$/.test(GTM_ID)) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }

  function clearCookies() {
    var host = window.location.hostname, parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-3).join('.'));
    (document.cookie || '').split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_gac|_fbp|_fbc)/.test(n)) return;
      domains.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function accept() {
    consented = true;
    gtag('consent', 'update', {
      ad_storage: 'granted', analytics_storage: 'granted',
      ad_user_data: 'granted', ad_personalization: 'granted'
    });
    persistAttribution();
    loadGTM();
  }
  function withdraw() {
    consented = false;
    gtag('consent', 'update', {
      ad_storage: 'denied', analytics_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    try { sessionStorage.removeItem(ATTR_KEY); } catch (e) {}
    clearCookies();
  }

  function push(eventName, extra) {
    var o = { event: eventName };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    window.dataLayer.push(o);
  }

  // Contact form submitted successfully (no personal data is sent to the dataLayer)
  function leadSubmitted() {
    var a = attribution(), p = { form_id: 'contact_form', form_name: 'Contact' };
    PARAMS.concat(['landing_page', 'referrer']).forEach(function (k) { if (a[k]) p[k] = a[k]; });
    push('generate_lead', p);
  }

  // Phone, email, social and directions clicks
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) push('click_to_call', { link_url: href });
    else if (href.indexOf('mailto:') === 0) push('click_email', { link_url: href });
    else if (/instagram\.com|facebook\.com/.test(href))
      push('click_social', { link_url: href, network: /instagram/.test(href) ? 'instagram' : 'facebook' });
    else if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(href))
      push('click_directions', { link_url: href });
  }, true);

  function init() {
    if (storedConsent() === 'accepted') accept();
    var acc = document.getElementById('accept-cookies'), dec = document.getElementById('decline-cookies');
    if (acc) acc.addEventListener('click', accept);
    if (dec) dec.addEventListener('click', withdraw);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.PlumMexTracking = { attribution: attribution, leadSubmitted: leadSubmitted, accept: accept, withdraw: withdraw };
})();
