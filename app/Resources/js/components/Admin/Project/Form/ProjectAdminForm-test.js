// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminForm } from './ProjectAdminForm';
import { formMock, intlMock, $refType, $fragmentRefs } from '~/mocks';

describe('<ProjectAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: {
      $fragmentRefs,
      $refType,
      id: '1',
      title: 'testTitle',
      type: {
        id: '1',
      },
      authors: [],
      steps: [],
      opinionTerm: 1,
    },
    formName: 'ProjectAdminForm',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
