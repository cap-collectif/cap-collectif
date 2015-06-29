'use strict';

import Fetcher from '../services/Fetcher';


export default {

  create: (uri, object, data) => {

    Fetcher
    .post('/' + uri + '/' + object + '/comments', data)
    .then((response) => {
      return true;
    });

  }

}
