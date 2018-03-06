/*eslint-disable */

var document = window.document;
var supportsTextContent = 'textContent' in document.body;

var cookieChoices = function() {
  var cookieName = 'displayCookieConsent';
  var cookieConsentId = 'cookieChoiceInfo';
  var dismissLinkId = 'cookieChoiceDismiss';

  function _createHeaderElement(
    cookieText,
    dismissText,
    linkText,
    linkHref,
    linkTitle,
    dismissLinkTitle
  ) {
    var butterBarStyles = 'margin-bottom:0;text-align:center;';

    var cookieConsentElement = document.createElement('div');
    cookieConsentElement.id = cookieConsentId;
    cookieConsentElement.className = 'alert alert-info';
    cookieConsentElement.style.cssText = butterBarStyles;
    cookieConsentElement.appendChild(_createConsentText(cookieText));

    if (!!linkText && !!linkHref) {
      cookieConsentElement.appendChild(_createInformationLink(linkText, linkHref, linkTitle));
    }
    cookieConsentElement.appendChild(_createDismissLink(dismissText, dismissLinkTitle));
    return cookieConsentElement;
  }

  function _setElementText(element, text) {
    if (supportsTextContent) {
      element.textContent = text;
    } else {
      element.innerText = text;
    }
  }

  function _createConsentText(cookieText) {
    var consentText = document.createElement('span');
    _setElementText(consentText, cookieText);
    return consentText;
  }

  function _createDismissLink(dismissText, dismissLinkTitle) {
    var dismissLink = document.createElement('a');
    _setElementText(dismissLink, dismissText);
    dismissLink.id = dismissLinkId;
    dismissLink.href = '#';
    dismissLink.title = dismissLinkTitle;
    dismissLink.style.marginLeft = '24px';
    dismissLink.className = 'btn  btn-darkest-gray';
    return dismissLink;
  }

  function _createInformationLink(linkText, linkHref, linkTitle) {
    var infoLink = document.createElement('a');
    _setElementText(infoLink, linkText);
    infoLink.href = linkHref;
    infoLink.target = '';
    infoLink.title = linkTitle;
    infoLink.style.marginLeft = '8px';
    return infoLink;
  }

  function _dismissLinkClick() {
    _saveUserPreference();
    _removeCookieConsent();
    return false;
  }

  function _showCookieConsent(
    cookieText,
    dismissText,
    linkText,
    linkHref,
    isDialog,
    linkTitle,
    dismissLinkTitle
  ) {
    if (_shouldDisplayConsent()) {
      _removeCookieConsent();
      var consentElement = _createHeaderElement(
        cookieText,
        dismissText,
        linkText,
        linkHref,
        linkTitle,
        dismissLinkTitle
      );
      var fragment = document.createDocumentFragment();
      fragment.appendChild(consentElement);
      document.body.insertBefore(fragment.cloneNode(true), document.body.firstChild);
      document.getElementById(dismissLinkId).onclick = _dismissLinkClick;
    }
  }

  var showCookieConsentBar = function(
    cookieText,
    dismissText,
    linkText,
    linkHref,
    linkTitle,
    dismissLinkTitle
  ) {
    _showCookieConsent(
      cookieText,
      dismissText,
      linkText,
      linkHref,
      false,
      linkTitle,
      dismissLinkTitle
    );
  };

  var showCookieConsentDialog = function(cookieText, dismissText, linkText, linkHref) {
    _showCookieConsent(cookieText, dismissText, linkText, linkHref, true);
  };

  function _removeCookieConsent() {
    var cookieChoiceElement = document.getElementById(cookieConsentId);
    if (cookieChoiceElement != null) {
      cookieChoiceElement.parentNode.removeChild(cookieChoiceElement);
    }
  }

  function _saveUserPreference() {
    // Set the cookie expiry to one year after today.
    var expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `${cookieName}=y; expires=${expiryDate.toGMTString()}`;
  }

  function _shouldDisplayConsent() {
    // Display the header only if the cookie has not been set.
    return !document.cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  }

  return {
    showCookieConsentBar,
    showCookieConsentDialog
  };
};

export default new cookieChoices();
