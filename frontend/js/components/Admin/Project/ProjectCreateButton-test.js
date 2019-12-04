// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectCreateButton } from './ProjectCreateButton';
import { intlMock } from '../../../mocks';

describe('<ProjectCreateButton />', () => {
  const defaultProps = {
    intl: intlMock,
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectCreateButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
