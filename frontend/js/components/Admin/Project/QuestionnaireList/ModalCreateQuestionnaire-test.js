// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ModalCreateQuestionnaire from './ModalCreateQuestionnaire';
import { intlMock } from '~/mocks';

const props = {
  intl: intlMock,
  viewerId: 'viewer-123',
  isAdmin: true,
  orderBy: 'DESC',
  term: 'test de recherche',
  show: true,
  onClose: jest.fn(),
};

describe('<ModalCreateQuestionnaire  />', () => {
  it('should renders correcty', () => {
    const wrapper = shallow(<ModalCreateQuestionnaire {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
