// @flow
import Analytics from 'analytics';

export type ANALYTICS_ACTIONS =
  | 'registration_click'
  | 'registration_submit_click'
  | 'registration_close_click'
  | 'debate_vote_click';

export const analytics = Analytics({
  app: window.location.hostname,
  plugins: [
    {
      name: 'Analythicccs',
      track: ({ payload }: {| payload: { event: ANALYTICS_ACTIONS, properties?: any } |}) => {
        if (window.gtag) window.gtag('event', payload.event, payload.properties);
      },
    },
  ],
});
