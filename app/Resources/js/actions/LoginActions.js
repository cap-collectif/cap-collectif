import AppDispatcher from '../dispatchers/AppDispatcher';
import {LOGIN_USER, LOGOUT_USER} from '../constants/LoginConstants';

export default {

  loginUser: (jwt, user) => {
    const data = JSON.parse(user);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(data));

    AppDispatcher.dispatch({
      actionType: LOGIN_USER,
      jwt: jwt,
      user: data,
    });
  },

  logoutUser: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');

    AppDispatcher.dispatch({
      actionType: LOGOUT_USER,
    });
  },

};
