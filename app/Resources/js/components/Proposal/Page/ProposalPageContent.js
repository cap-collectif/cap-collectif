import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ProposalFusionList from './ProposalFusionList';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import ProposalEditModal from '../Edit/ProposalEditModal';
import ProposalDeleteModal from '../Delete/ProposalDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import ProposalReportButton from '../Report/ProposalReportButton';
import ProposalResponse from './ProposalResponse';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import { openDeleteProposalModal, openEditProposalModal } from '../../../redux/modules/proposal';

const ProposalPageContent = React.createClass({
  displayName: 'ProposalPageContent',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    className: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const {
      proposal,
      className,
      form,
      categories,
      dispatch,
    } = this.props;
    const classes = {
      proposal__content: true,
      [className]: true,
    };
    return (
      <div className={classNames(classes)}>
        {
          proposal.media &&
            <img
              id="proposal-media"
              src={proposal.media.url}
              role="presentation"
              className="block img-responsive"
            />
        }
        <ProposalFusionList proposal={proposal} type="From" />
        <ProposalFusionList proposal={proposal} type="Into" />
        <div className="block">
          <h3 className="h3">{ this.getIntlMessage('proposal.description') }</h3>
          <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
        </div>
        {
          proposal.responses.map((response, index) =>
            <ProposalResponse
              key={index}
              response={response}
            />,
          )
        }
        <div className="block proposal__buttons">
          <ProposalVoteButtonWrapper
            proposal={proposal}
            id="proposal-vote-btn"
            style={{ marginRight: 15 }}
          />
          <ShareButtonDropdown
            id="proposal-share-button"
            url={proposal._links.show}
            title={proposal.title}
          />
          <ProposalReportButton proposal={proposal} />
          <div className="pull-right">
            <EditButton
              id="proposal-edit-button"
              author={proposal.author}
              onClick={() => { dispatch(openEditProposalModal()); }}
              editable={form.isContribuable}
            />
            <DeleteButton
              id="proposal-delete-button"
              author={proposal.author}
              onClick={() => { dispatch(openDeleteProposalModal()); }}
              style={{ marginLeft: '15px' }}
              deletable={form.isContribuable}
            />
          </div>
        </div>
        <ProposalEditModal
          proposal={proposal}
          form={form}
          categories={categories}
        />
        <ProposalDeleteModal
          proposal={proposal}
          form={form}
        />
      </div>
    );
  },

});

export default connect()(ProposalPageContent);
