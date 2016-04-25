import AppDispatcher from '../dispatchers/AppDispatcher';
import { LOGIN_USER, LOGOUT_USER } from '../constants/LoginConstants';
import LocalStorageService from '../services/LocalStorageService';

export default {

  cachedLoginUser: () => {
    AppDispatcher.dispatch({
      actionType: LOGIN_USER,
      jwt: LocalStorageService.get('jwt'),
      user: LocalStorageService.get('user'),
    });
  },

  loginUser: (jwt, user) => {
    const data = JSON.parse(user);
    LocalStorageService.set('jwt', jwt);
    LocalStorageService.set('user', data);

    AppDispatcher.dispatch({
      actionType: LOGIN_USER,
      jwt: jwt,
      user: data,
    });
  },

  logoutUser: () => {
    LocalStorageService.remove('jwt');
    LocalStorageService.remove('user');

    AppDispatcher.dispatch({
      actionType: LOGOUT_USER,
    });
  },

};
