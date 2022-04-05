// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { CampaignItem } from './CampaignItem';
import { $refType } from '~/mocks';

const baseProps = {
  rowId: '1',
  campaign: {
    $refType,
    id: '1',
    name: 'Je suis une campagne',
    sendAt: '2030-03-11 00:00:00',
    status: 'DRAFT',
    mailingList: {
      name: 'Je suis une mailing list',
    },
    mailingInternal: null,
    emailingGroup: null,
    project: null,
  },
  selected: false,
};

const props = {
  basic: baseProps,
  selected: { ...baseProps, selected: true },
  noMailingList: {
    ...baseProps,
    campaign: {
      ...baseProps.campaign,
      mailingList: null,
    },
  },
  noSendAt: {
    ...baseProps,
    campaign: {
      ...baseProps.campaign,
      sendAt: null,
    },
  },
  withMailingInternal: {
    ...baseProps,
    campaign: {
      ...baseProps.campaign,
      mailingInternal: 'REGISTERED',
      mailingList: null,
    },
  },
  withGroup: {
    ...baseProps,
    campaign: {
      ...baseProps.campaign,
      mailingList: null,
      emailingGroup: {
        title: 'Je suis un group',
      },
    },
  },
};

describe('<CampaignItem />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<CampaignItem {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when selected', () => {
    const wrapper = shallow(<CampaignItem {...props.selected} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when no mailing list', () => {
    const wrapper = shallow(<CampaignItem {...props.noMailingList} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when no send at', () => {
    const wrapper = shallow(<CampaignItem {...props.noSendAt} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with mailing list internal', () => {
    const wrapper = shallow(<CampaignItem {...props.withMailingInternal} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly with users group', () => {
    const wrapper = shallow(<CampaignItem {...props.withGroup} />);
    expect(wrapper).toMatchSnapshot();
  });
});
