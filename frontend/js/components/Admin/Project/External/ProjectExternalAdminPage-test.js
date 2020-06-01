// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectExternalAdminPage } from './ProjectExternalAdminPage';
import { formMock, intlMock, $refType, $fragmentRefs } from '../../../../mocks';
import { features } from '../../../../redux/modules/default';

describe('<ProjectExternalAdminPage />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    dispatch: jest.fn(),
    formName: 'ProjectExternalAdminForm',
    features: {
      ...features,
      external_project: true,
    },
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
