// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalContactButton } from './ProposalContactButton';

describe('<ProposalContactButton />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <ProposalContactButton proposalId="proposalId324Z" authorName="Gisele" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
