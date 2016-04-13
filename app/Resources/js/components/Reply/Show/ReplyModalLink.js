import React from 'react';
import { IntlMixin, FormattedMessage, FormattedDate } from 'react-intl';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import ShowReplyModal from './ShowReplyModal';

const ReplyModalLink = React.createClass({
  propTypes: {
    reply: React.PropTypes.object.isRequired,
    form: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      label: null,
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  showModal() {
    this.setState({
      showModal: true,
    });
  },

  hideModal() {
    this.setState({
      showModal: false,
    });
  },

  render() {
    const { reply, form } = this.props;

    return (
      <p className="reply" id={'reply-link-' + reply.id }>
        <Button onClick={this.showModal} bsStyle="link">
          {
            this.props.label
            || <FormattedMessage
                message={this.getIntlMessage('reply.show.link')}
                date={
                  <FormattedDate
                    value={moment(reply.created_at)}
                    day="numeric" month="long" year="numeric"
                  />
                }
            />
          }
        </Button>
        <ShowReplyModal
          show={this.state.showModal}
          onClose={this.hideModal}
          reply={reply}
          form={form}
        />
      </p>
    );
  },

});

export default ReplyModalLink;
