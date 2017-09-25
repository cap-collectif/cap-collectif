import LoginActions from '../actions/LoginActions';
import LocalStorageService from './LocalStorageService';

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(response.statusText);
}

function json(response) {
  return response.json();
}

class AuthService {
  constructor() {
    this.hasRequestedToken = false;
  }

  isUser() {
    return LocalStorageService.isValid('jwt');
  }

  isAnonymous() {
    return !LocalStorageService.get('jwt') && this.hasRequestedToken;
  }

  login() {
    if (this.isUser() || this.isAnonymous()) {
      return Promise.resolve();
    }
    return fetch(`${window.location.protocol}//${window.location.host}/get_api_token`, {
      method: 'get',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(status)
      .then(json)
      .then(data => {
        this.hasRequestedToken = true;
        return data.token ? LoginActions.loginUser(data.token) : this.logout();
      });
  }

  logout() {
    LoginActions.logoutUser();
  }
}

export default new AuthService();
