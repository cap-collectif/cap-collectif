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

const ProposalPageContent = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    className: PropTypes.string,
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
          <ProposalReportButton proposal={proposal} />
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
          categories={this.props.categories}
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
