// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DeleteModal } from './DeleteModal';

describe('<DeleteModal />', () => {
  const props = {
    showDeleteModal: true,
    closeDeleteModal: jest.fn(),
    deleteElement: jest.fn(),
    deleteModalTitle: 'titre.de.la.modal.de.suppression',
    deleteModalContent: 'contenu.de.la.modal.de.suppression',
  };

  it('render correctly Delete Modal', () => {
    const wrapper = shallow(<DeleteModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
