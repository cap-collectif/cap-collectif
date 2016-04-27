import LocalStorageService from '../services/LocalStorageService';

export default {

  loginUser: (jwt, user) => {
    const data = JSON.parse(user);
    LocalStorageService.set('jwt', jwt);
    LocalStorageService.set('user', data);
  },

  logoutUser: () => {
    LocalStorageService.remove('jwt');
    LocalStorageService.remove('user');
  },

};
