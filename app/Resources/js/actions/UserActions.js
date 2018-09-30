import Fetcher from '../services/Fetcher';

export default {
  update: data => {
    return Fetcher.put('/users/me', data);
  },

  sendConfirmSms: () => {
    return Fetcher.post('/send-sms-confirmation');
  },

  sendSmsCode: data => {
    return Fetcher.post('/sms-confirmation', data);
  },
};
