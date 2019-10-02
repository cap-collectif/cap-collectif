// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminCategories } from './ProposalFormAdminCategories';
import { intlMock } from '../../mocks';

describe('<ProposalFormAdminCategories />', () => {
  const props = {
    dispatch: jest.fn(),
    fields: { length: 0, map: () => [], remove: jest.fn() },
    categories: [],
    categoryImages: [],
    intl: intlMock,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategories {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
