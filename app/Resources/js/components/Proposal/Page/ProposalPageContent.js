import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import ProposalEditModal from '../Edit/ProposalEditModal';
import ProposalDeleteModal from '../Delete/ProposalDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import ProposalReportButton from '../Report/ProposalReportButton';
import ProposalResponse from './ProposalResponse';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';

const ProposalPageContent = React.createClass({
  displayName: 'ProposalPageContent',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    className: PropTypes.string,
    selectionStep: PropTypes.object,
    creditsLeft: PropTypes.number,
    userHasVote: PropTypes.bool.isRequired,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      selectionStep: null,
      creditsLeft: null,
    };
  },

  getInitialState() {
    return {
      showEditModal: false,
      showDeleteModal: false,
    };
  },

  toggleEditModal(value) {
    this.setState({ showEditModal: value });
  },

  toggleDeleteModal(value) {
    this.setState({ showDeleteModal: value });
  },

  render() {
    const {
      proposal,
      className,
      form,
      categories,
      userHasVote,
      selectionStep,
      creditsLeft,
      onVote,
    } = this.props;
    const { showEditModal, showDeleteModal } = this.state;
    const classes = {
      proposal__content: true,
      [className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <div className="block">
          <h2 className="h2">{ this.getIntlMessage('proposal.description') }</h2>
          <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
        </div>
        {
          proposal.responses.map((response, index) => {
            return <ProposalResponse key={index} response={response} />;
          })
        }
        <div className="block proposal__buttons">
          <ProposalVoteButtonWrapper
            selectionStep={selectionStep}
            proposal={proposal}
            creditsLeft={creditsLeft}
            userHasVote={userHasVote}
            onClick={onVote}
          />
          <ShareButtonDropdown
            id="proposal-share-button"
            url={proposal._links.show}
            title={proposal.title}
            style={{ marginLeft: '15px' }}
          />
          <ProposalReportButton proposal={proposal} />
          <div className="pull-right">
            <EditButton
              id="proposal-edit-button"
              author={proposal.author}
              onClick={this.toggleEditModal.bind(null, true)}
              editable={form.isContribuable}
            />
            <DeleteButton
              id="proposal-delete-button"
              author={proposal.author}
              onClick={this.toggleDeleteModal.bind(null, true)}
              style={{ marginLeft: '15px' }}
              deletable={form.isContribuable}
            />
          </div>
        </div>
        <ProposalEditModal
          proposal={proposal}
          form={form}
          categories={categories}
          show={showEditModal}
          onToggleModal={this.toggleEditModal}
        />
        <ProposalDeleteModal
          proposal={proposal}
          form={form}
          show={showDeleteModal}
          onToggleModal={this.toggleDeleteModal}
        />
      </div>
    );
  },

});

export default ProposalPageContent;
