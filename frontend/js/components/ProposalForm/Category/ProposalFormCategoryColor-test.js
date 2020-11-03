// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormCategoryColor } from './ProposalFormCategoryColor';

describe('<ProposalFormCategoryColor />', () => {
  const props = {
    onColorClick: jest.fn(),
    id: 'iddddddddd',
    selectedColor: 'blue',
    categoryColors: [
      { value: 'blue', used: true },
      { value: 'red', used: false },
      { value: 'yellow', used: true },
    ],
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormCategoryColor {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
