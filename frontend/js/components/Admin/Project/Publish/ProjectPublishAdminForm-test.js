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

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        url: '/sku',
        publishedAt: '18/08/1998',
      },
    };
    const wrapper = shallow(<ProjectPublishAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
