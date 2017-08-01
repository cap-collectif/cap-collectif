/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalAdminContentForm from './ProposalAdminContentForm';

describe('<ProposalAdminContentForm />', () => {
  const props = {};

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminContentForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
