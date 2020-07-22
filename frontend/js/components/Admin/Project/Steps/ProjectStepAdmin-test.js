// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdmin } from './ProjectStepAdmin';
import { $fragmentRefs, $refType, formMock, intlMock } from '~/mocks';

const props = {
  ...formMock,
  intl: intlMock,
  form: 'testForm',
  project: {
    $fragmentRefs,
    $refType,
  },
};

describe('<ProjectStepAdmin />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
