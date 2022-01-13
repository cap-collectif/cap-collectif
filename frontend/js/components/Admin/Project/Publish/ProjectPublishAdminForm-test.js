// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectPublishAdminForm } from './ProjectPublishAdminForm';
import { formMock, intlMock, $refType } from '~/mocks';
import { disableFeatureFlags, enableFeatureFlags } from '~/testUtils';

describe('<ProjectPublishAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
  };
  afterEach(() => {
    disableFeatureFlags();
  });
  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectPublishAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without multilangue', () => {
    const props = {
      ...defaultProps,
    };
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
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
        locale: null,
        archived: false,
      },
    };
    enableFeatureFlags(['multilangue']);
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
          value: 'locale-en-GB',
          label: 'french',
        },
        archived: false,
      },
    };
    enableFeatureFlags(['multilangue']);
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
