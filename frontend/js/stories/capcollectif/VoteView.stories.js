// @flow
import * as React from 'react';
import VoteView from '~/components/Ui/Vote/VoteView';

export default {
  title: 'Cap Collectif/VoteView',
  component: VoteView,
  argTypes: {
    positivePercentage: {
      control: {
        type: 'number',
        description: 'Pourcentage de votes pour',
      },
    },
  },
};

const Template = (args: any) => (
  <VoteView positivePercentage={args.positivePercentage} votesCount={null} />
);
export const main = Template.bind({});
main.storyName = 'Default';
main.args = { positivePercentage: 66 };

const MobileTemplate = (args: any) => (
  <VoteView positivePercentage={args.positivePercentage} votesCount={null} isMobile />
);

const WithVoteCountTemplate = (args: any) => (
  <VoteView
    positivePercentage={args.positivePercentage}
    votesCount={{ FOR: 12, AGAINST: 24 }}
    isMobile
  />
);

export const Mobile = MobileTemplate.bind({});
Mobile.args = {
  positivePercentage: 32,
};
export const WithVoteCount = WithVoteCountTemplate.bind({});
WithVoteCountTemplate.args = { positivePercentage: 70 };
