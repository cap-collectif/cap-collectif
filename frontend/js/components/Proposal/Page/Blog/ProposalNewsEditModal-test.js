// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalNewsEditModal } from './ProposalNewsEditModal';
import { $refType, formMock, $fragmentRefs, intlMock } from '~/mocks';

describe('<ProposalNewsEditModal />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    show: false,
    displayModal: jest.fn(),
    currentLanguage: 'fr-FR',
    onClose: jest.fn(),
    post: {
      id: 'pos1',
      authors: [
        {
          id: 'author1',
          slug: 'omar-bg',
        },
      ],
      $fragmentRefs,
      $refType,
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with modal open', () => {
    const openedModal = {
      ...props,
      show: true,
    };
    const wrapper = shallow(<ProposalNewsEditModal {...openedModal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
