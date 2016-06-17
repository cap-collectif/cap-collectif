import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import ProposalEditModal from '../Edit/ProposalEditModal';
import ProposalDeleteModal from '../Delete/ProposalDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import ReportButton from '../../Form/ReportButton';
import ProposalResponse from './ProposalResponse';

const ProposalPageContent = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
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
    const proposal = this.props.proposal;
    const classes = {
      'proposal__content': true,
      [this.props.className]: true,
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
          <ShareButtonDropdown
            id="proposal-share-button"
            url={proposal._links.show}
            title={proposal.title}
          />
          <ReportButton
            id="proposal-report-button"
            author={proposal.author}
            url={proposal._links.report}
            hasReported={proposal.hasUserReported}
            style={{ marginLeft: '15px' }}
          />
          <div className="pull-right">
            <EditButton
              id="proposal-edit-button"
              author={this.props.proposal.author}
              onClick={this.toggleEditModal.bind(null, true)}
              editable={this.props.form.isContribuable}
            />
            <DeleteButton
              id="proposal-delete-button"
              author={this.props.proposal.author}
              onClick={this.toggleDeleteModal.bind(null, true)}
              style={{ marginLeft: '15px' }}
              deletable={this.props.form.isContribuable}
            />
          </div>
        </div>
        <ProposalEditModal
          proposal={this.props.proposal}
          form={this.props.form}
          themes={this.props.themes}
          districts={this.props.districts}
          show={this.state.showEditModal}
          onToggleModal={this.toggleEditModal}
        />
        <ProposalDeleteModal
          proposal={this.props.proposal}
          form={this.props.form}
          show={this.state.showDeleteModal}
          onToggleModal={this.toggleDeleteModal}
        />
      </div>
    );
  },

});

export default ProposalPageContent;
