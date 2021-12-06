// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ModalCreateQuestionnaire from './ModalCreateQuestionnaire';
import { intlMock, $fragmentRefs } from '~/mocks';

const props = {
  intl: intlMock,
  viewer: {
    id: 'viewer-123',
    __typename: 'User',
    username: 'toto',
    allQuestionnaire: {
      totalCount: 1,
    },
    $fragmentRefs,
  },
  isAdmin: true,
  orderBy: 'DESC',
  term: 'test de recherche',
  show: true,
  onClose: jest.fn(),
  hasQuestionnaire: false,
};

describe('<ModalCreateQuestionnaire  />', () => {
  it('should renders correcty', () => {
    const wrapper = shallow(<ModalCreateQuestionnaire {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
