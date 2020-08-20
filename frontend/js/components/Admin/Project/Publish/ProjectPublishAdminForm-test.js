// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectPublishAdminForm } from './ProjectPublishAdminForm';
import { formMock, intlMock, $refType } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<ProjectPublishAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    features,
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectPublishAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without multilangue', () => {
    const props = {
      ...defaultProps,
    };
    props.features.multilangue = false;
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
      },
      features,
    };
    props.features.multilangue = true;
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
      },
      features,
    };
    props.features.multilangue = true;
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
