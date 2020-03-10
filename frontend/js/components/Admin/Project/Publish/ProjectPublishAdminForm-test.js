// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectPublishAdminForm } from './ProjectPublishAdminForm';
import { formMock, intlMock, $refType } from '~/mocks';

describe('<ProjectPublishAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectPublishAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project without locale', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        url: '/sku',
        publishedAt: '18/08/1998',
        locale: null
      },
    };
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project with locale', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        url: '/sku',
        publishedAt: '18/08/1998',
        locale: {
          value: 'locale-fr-FR',
          label: 'french'
        }
      },
    };
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
