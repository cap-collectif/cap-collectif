// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectContentAdminForm } from './ProjectContentAdminForm';
import { formMock, intlMock, $refType } from '~/mocks';
import MockProviders from '~/testUtils';

describe('<ProjectContentAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: false } } }}>
        <ProjectContentAdminForm {...defaultProps} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        title: 'testTitle',
        type: {
          id: '1',
        },
        video: 'dailymotion.com/issou',
        cover: null,
        authors: [],
        themes: [],
        districts: null,
        metaDescription: 'so meta',
        address: null,
      },
    };
    const wrapper = shallow(
      <MockProviders store={{ user: { user: { isAdmin: false } } }}>
        <ProjectContentAdminForm {...props} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
