/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock } from '../../../mocks';
import { UserAdminPageTabs } from './UserAdminPageTabs';

describe('<UserAdminPageTabs/>', () => {
  const props1 = {
    ...formMock,
    intl: intlMock,
  };

  const user = {
    url: 'https://fr.wikipedia.org/wiki/Dahu',
    username: 'dahu',
  };

  it('should render', () => {
    const wrapper = shallow(<UserAdminPageTabs {...props1} user={user} />);
    expect(wrapper).toMatchSnapshot();
  });
});
