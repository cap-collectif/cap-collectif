// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPage } from './ProposalFormAdminPage';

describe('<ProposalFormAdminPage />', () => {
  const props = {
    proposalFormId: '1',
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
