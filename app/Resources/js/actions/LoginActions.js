import LocalStorageService from '../services/LocalStorageService';

export default {
  loginUser: jwt => {
    LocalStorageService.set('jwt', jwt);
  },

  logoutUser: () => {
    LocalStorageService.remove('jwt');
  },
};
