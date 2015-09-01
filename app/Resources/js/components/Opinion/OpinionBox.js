import OpinionPreview from './OpinionPreview';
import OpinionButtons from './OpinionButtons';
import OpinionAppendices from './OpinionAppendices';
import OpinionBody from './OpinionBody';
import VotePiechart from '../Utils/VotePiechart';
import UserAvatar from '../User/UserAvatar';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  renderUserAvatarVotes() {
    const opinion = this.props.opinion;
    let votes = opinion.votes;
    let moreVotes = null;

    if (opinion.votes.length > 5) {
      votes = opinion.votes.slice(0, 5);
      moreVotes = opinion.votes.length - 5;
    }

    return (
      <div>
      {
        votes.map((vote) => {
          return <UserAvatar key={vote.user.id} user={vote.user} style={{marginRight: 5}} />;
        })
      }
      {moreVotes !== null
        ? <span>+ {moreVotes}</span>
        : <span />
      }
      </div>
    );
  },

  render() {
    const opinion = this.props.opinion;
    const color = this.isVersion() ? opinion.parent.type.color : opinion.type.color;
    const backLink = this.isVersion() ? opinion.parent._links.show : opinion._links.type;
    const backTitle = this.isVersion() ? opinion.parent.type.title : opinion.type.title;

    const colorClass = 'opinion opinion--' + color + ' opinion--current';
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered">
            <a className="neutral-hover pull-left h4 opinion__header__back" href={backLink}>
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs hidden-sm"> {this.getIntlMessage('global.back')}</span>
            </a>
            <h2 className="h4 opinion__header__title"> {backTitle}</h2>
          </div>
          <OpinionPreview opinion={opinion} link={false} />
        </div>
        <OpinionAppendices opinion={opinion} />
        <div className="opinion__description">
          <OpinionBody opinion={opinion} />
          <div className="opinion__buttons" style={{marginBottom: 0}}>
            <OpinionButtons {...this.props} opinion={opinion} />
          </div>
          {opinion.votes.length >= 1
          ? <Row style={{borderTop: '1px solid #ddd', marginTop: 15}}>
              <Col sm={12} mdOffset={1} md={3} >
                <VotePiechart top={20} height={180} ok={opinion.votes_ok} nok={opinion.votes_nok} mitige={opinion.votes_mitige} />
              </Col>
              <Col sm={12} md={5} style={{marginTop: 60}}>
                {this.renderUserAvatarVotes()}
                <div><FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes.length} /></div>
              </Col>
            </Row>
          : <span />
          }
        </div>
      </div>
    );
  },

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },


});

export default OpinionBox;
