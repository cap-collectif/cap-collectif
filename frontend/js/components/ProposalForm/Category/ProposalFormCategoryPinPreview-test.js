// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormCategoryPinPreview } from './ProposalFormCategoryPinPreview';

describe('<ProposalFormCategoryPinPreview />', () => {
  const props = {
    color: 'blue',
    icon: 'parking',
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormCategoryPinPreview {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
