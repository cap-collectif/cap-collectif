// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectExternalAdminPage } from './ProjectExternalAdminPage';
import { formMock, intlMock, $refType, $fragmentRefs } from '../../../../mocks';

describe('<ProjectExternalAdminPage />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    dispatch: jest.fn(),
    formName: 'ProjectExternalAdminForm',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectExternalAdminPage {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        $fragmentRefs,
      },
    };
    const wrapper = shallow(<ProjectExternalAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
