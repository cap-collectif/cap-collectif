// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectStepAdmin from './ProjectStepAdmin';
import { formMock, intlMock } from '../../../../mocks';

describe('<ProjectStepAdmin />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdmin form="testForm" {...formMock} intl={intlMock} />);
    expect(wrapper).toMatchSnapshot();
  });
});
