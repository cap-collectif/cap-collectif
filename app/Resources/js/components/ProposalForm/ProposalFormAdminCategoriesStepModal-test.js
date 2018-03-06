// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminCategoriesStepModal } from './ProposalFormAdminCategoriesStepModal';

describe('<ProposalFormAdminCategoriesStepModal />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    member: 'member',
    isCreating: true,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategoriesStepModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
