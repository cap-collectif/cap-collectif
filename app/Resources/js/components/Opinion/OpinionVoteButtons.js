const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Button = ReactBootstrap.Button;

const OpinionVoteButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      vote: null,
    };
  },

  vote(value) {
    this.setState({vote: value});
  },

  render() {
    const vote = this.state.vote;
    return (
      <ButtonToolbar className="opinion-vote-toolbar">
          <Button bsStyle={vote === 1 ? 'success' : 'default'} onClick={this.vote.bind(this, 1)} active={vote === 1 ? true : false}>
            <i className="cap cap-hand-like-2-1"></i>
            { ' ' + this.getIntlMessage('vote.ok') }
          </Button>
          <Button bsStyle={vote === 0 ? 'warning' : 'default'} onClick={this.vote.bind(this, 0)}>
            <i className="cap cap-hand-like-2 icon-rotate"></i>
            { ' ' + this.getIntlMessage('vote.mitige') }
          </Button>
          <Button bsStyle={vote === -1 ? 'danger' : 'default'} onClick={this.vote.bind(this, -1)}>
            <i className="cap cap-hand-unlike-2-1"></i>
            { ' ' + this.getIntlMessage('vote.nok') }
          </Button>
      </ButtonToolbar>
    );
  },



/*
            <form name="opinionVoteForm" method="post" action="" id="opinion_vote_form" className="vote-form ">
              <div id="opinionVoteForm_value" name="opinionVoteForm[value]" required="required" onchange="document.getElementById('opinion_vote_form').submit()">
                <div className="opinion__vote-group">
                  <a className="connection-popover-js" style={{display: 'block'}}>
                    <div data-toggle="buttons">
                      <label className="btn btn-success btn--outline">
                        <input type="radio" id="opinionVoteForm_value_0" name="opinionVoteForm[value]" required="required" value="1" />
                        <i className="cap cap-hand-like-2-1"></i> D'accord
                      </label>
                    </div>
                  </a>
                </div>
                <div className="opinion__vote-group">
                <a className="connection-popover-js" style={{display: 'block'}}>
                  <div data-toggle="buttons">
                    <label className="btn btn-warning active">
                      <input type="radio" id="opinionVoteForm_value_1" name="opinionVoteForm[value]" required="required" value="0" checked="checked" />
                      <i className="cap cap-hand-like-2 icon-rotate"></i> Mitigé
                    </label>
                  </div>
                </a>
              </div>
              <div className="opinion__vote-group">
                <a className="connection-popover-js" style={{display: 'block'}}>
                  <div data-toggle="buttons">
                    <label className="btn btn-danger btn--outline">
                      <input type="radio" id="opinionVoteForm_value_2" name="opinionVoteForm[value]" required="required" value="-1" />
                      <i className="cap cap-hand-unlike-2-1"></i> Pas d'accord
                    </label>
                  </div>
                </a>
              </div>
            </div>
          </form>
*/
});

export default OpinionVoteButtons;
