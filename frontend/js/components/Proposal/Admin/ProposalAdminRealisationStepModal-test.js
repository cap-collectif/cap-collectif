// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminRealisationStepModal } from './ProposalAdminRealisationStepModal';

describe('<ProposalAdminRealisationStepModal />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    member: 'member',
    isCreating: true,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminRealisationStepModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
