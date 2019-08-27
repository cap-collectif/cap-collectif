import Fetcher from '../services/Fetcher';

export default {
  update: data => Fetcher.put('/users/me', data),

  sendConfirmSms: () => Fetcher.post('/send-sms-confirmation'),

  sendSmsCode: data => Fetcher.post('/sms-confirmation', data),
};
