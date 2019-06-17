// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalListSearch } from './ProposalListSearch';
import { intlMock } from '../../../mocks';

describe('<ProposalListSearch />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    terms: 'This is some terms',
    intl: intlMock,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalListSearch {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
