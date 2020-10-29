// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { MailParameterPage } from './MailParameterPage';
import { $refType, $fragmentRefs, formMock } from '~/mocks';

const baseProps = {
  ...formMock,
  dispatch: jest.fn(),
  emailingCampaign: {
    $refType,
    $fragmentRefs,
    id: 'emailingCampaign123',
    name: 'Je suis une emailing list',
    senderEmail: 'captain.obious@cap-collectif.com',
    senderName: 'Captain Obvious',
    object: 'Ceci est le sujet',
    content: 'Ceci est du contenu',
    mailingList: {
      id: 'mailingList123',
    },
    mailingInternal: null,
    sendAt: '2030-03-11 00:00:00',
    status: 'DRAFT',
  },
  query: {
    $refType,
    $fragmentRefs,
  },
  registeredFieldsName: ['blablaField', 'bruhField'],
};

const props = {
  basic: baseProps,
  disabled: {
    ...baseProps,
    emailingCampaign: {
      ...baseProps.emailingCampaign,
      status: 'SENT',
    },
  },
};

describe('<MailParameterPage />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<MailParameterPage {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when disabled', () => {
    const wrapper = shallow(<MailParameterPage {...props.disabled} />);
    expect(wrapper).toMatchSnapshot();
  });
});
