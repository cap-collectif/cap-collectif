/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageButtons from './IdeaPageButtons';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import IdeaReportButton from '../Report/IdeaReportButton';
import IdeaEditModal from '../Edit/IdeaEditModal';
import IdeaDeleteModal from '../Delete/IdeaDeleteModal';

const props = {
  themes: [],
  idea: {
    title: 'Title',
    author: {},
    canContribute: false,
    _links: {
      show: '',
    },
  },
};

describe('<IdeaPageButtons />', () => {
  it('it should render all idea buttons and modals', () => {
    const wrapper = shallow(<IdeaPageButtons {...props} {...IntlData} />);
    expect(wrapper.find('div.idea__buttons')).toHaveLength(1);
    const shareButton = wrapper.find(ShareButtonDropdown);
    expect(shareButton).toHaveLength(1);
    expect(shareButton.prop('id')).toEqual('idea-share-button');
    expect(shareButton.prop('title')).toEqual(props.idea.title);
    expect(shareButton.prop('url')).toEqual(props.idea._links.show);
    const reportButton = wrapper.find(IdeaReportButton);
    expect(reportButton).toHaveLength(1);
    expect(reportButton.prop('idea')).toEqual(props.idea);
    const editButton = wrapper.find(EditButton);
    expect(editButton).toHaveLength(1);
    expect(editButton.prop('id')).toEqual('idea-edit-button');
    expect(editButton.prop('author')).toEqual(props.idea.author);
    expect(editButton.prop('onClick')).toBeDefined();
    expect(editButton.prop('editable')).toEqual(props.idea.canContribute);
    const deleteButton = wrapper.find(DeleteButton);
    expect(deleteButton).toHaveLength(1);
    expect(deleteButton.prop('id')).toEqual('idea-delete-button');
    expect(deleteButton.prop('author')).toEqual(props.idea.author);
    expect(deleteButton.prop('onClick')).toBeDefined();
    expect(deleteButton.prop('deletable')).toEqual(props.idea.canContribute);
    const editModal = wrapper.find(IdeaEditModal);
    expect(editModal).toHaveLength(1);
    expect(editModal.prop('idea')).toEqual(props.idea);
    expect(editModal.prop('show')).toEqual(wrapper.state('showEditModal'));
    expect(editModal.prop('onToggleModal')).toBeDefined();
    const deleteModal = wrapper.find(IdeaDeleteModal);
    expect(deleteModal).toHaveLength(1);
    expect(deleteModal.prop('idea')).toEqual(props.idea);
    expect(deleteModal.prop('show')).toEqual(wrapper.state('showDeleteModal'));
    expect(deleteModal.prop('onToggleModal')).toBeDefined();
  });
});
