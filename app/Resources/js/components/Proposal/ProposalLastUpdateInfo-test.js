// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalLastUpdateInfo } from './ProposalLastUpdateInfo';

describe('<ProposalLastUpdateInfo />', () => {
  const proposalNotUpdated = {
    // $FlowFixMe $refType
    proposal: {
      updatedAt: null,
      updatedBy: null,
    },
  };

  const proposalUpdated = {
    // $FlowFixMe $refType
    proposal: {
      updatedAt: '2017-07-10T18:53:58+0200',
      updatedBy: { url: 'http://capco.dev', displayName: 'Paul' },
    },
  };

  const proposalUpdatedButWithoutUpdateAuthor = {
    // $FlowFixMe $refType
    proposal: {
      updatedAt: '2017-07-10T18:53:58+0200',
      updatedBy: null,
    },
  };

  it('renders not updated', () => {
    const wrapper = shallow(<ProposalLastUpdateInfo {...proposalNotUpdated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders updated', () => {
    const wrapper = shallow(<ProposalLastUpdateInfo {...proposalUpdated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders updated  without author', () => {
    const wrapper = shallow(<ProposalLastUpdateInfo {...proposalUpdatedButWithoutUpdateAuthor} />);
    expect(wrapper).toMatchSnapshot();
  });
});
