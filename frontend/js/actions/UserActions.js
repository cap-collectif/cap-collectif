// @flow
import Fetcher from '../services/Fetcher';

export default {
  update: (data: any) => Fetcher.put('/users/me', data),

  sendConfirmSms: () => Fetcher.post('/send-sms-confirmation'),

  sendSmsCode: (data: any) => Fetcher.post('/sms-confirmation', data),
};
