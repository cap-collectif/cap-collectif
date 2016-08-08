/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.find('div.idea__buttons')).to.have.length(1);
    const shareButton = wrapper.find(ShareButtonDropdown);
    expect(shareButton).to.have.length(1);
    expect(shareButton.prop('id')).to.equal('idea-share-button');
    expect(shareButton.prop('title')).to.equal(props.idea.title);
    expect(shareButton.prop('url')).to.equal(props.idea._links.show);
    const reportButton = wrapper.find(IdeaReportButton);
    expect(reportButton).to.have.length(1);
    expect(reportButton.prop('idea')).to.equal(props.idea);
    const editButton = wrapper.find(EditButton);
    expect(editButton).to.have.length(1);
    expect(editButton.prop('id')).to.equal('idea-edit-button');
    expect(editButton.prop('author')).to.equal(props.idea.author);
    expect(editButton.prop('onClick')).to.be.a('function');
    expect(editButton.prop('editable')).to.equal(props.idea.canContribute);
    const deleteButton = wrapper.find(DeleteButton);
    expect(deleteButton).to.have.length(1);
    expect(deleteButton.prop('id')).to.equal('idea-delete-button');
    expect(deleteButton.prop('author')).to.equal(props.idea.author);
    expect(deleteButton.prop('onClick')).to.be.a('function');
    expect(deleteButton.prop('deletable')).to.equal(props.idea.canContribute);
    const editModal = wrapper.find(IdeaEditModal);
    expect(editModal).to.have.length(1);
    expect(editModal.prop('idea')).to.equal(props.idea);
    expect(editModal.prop('show')).to.equal(wrapper.state('showEditModal'));
    expect(editModal.prop('onToggleModal')).to.be.a('function');
    const deleteModal = wrapper.find(IdeaDeleteModal);
    expect(deleteModal).to.have.length(1);
    expect(deleteModal.prop('idea')).to.equal(props.idea);
    expect(deleteModal.prop('show')).to.equal(wrapper.state('showDeleteModal'));
    expect(deleteModal.prop('onToggleModal')).to.be.a('function');
  });
});
