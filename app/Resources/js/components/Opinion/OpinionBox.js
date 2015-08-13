import OpinionPreview from './OpinionPreview';
import OpinionButtons from './OpinionButtons';
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

  render() {
    const opinion = this.props.opinion;
    const diff = JsDiff.diffWords(opinion.parent.body, opinion.body);
    let htmlBody = '';
    diff.forEach((part) => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      const decoration = color === 'red' ? 'line-through' : 'none';
      htmlBody += '<span style="color: ' + color + '; text-decoration: ' + decoration + '">' + part.value + '</span>';
    });

    const colorClass = 'opinion opinion--' + opinion.parent.type.color + ' opinion--current';
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered">
            <a className="neutral-hover pull-left h4 opinion__header__back" href={opinion.parent._links.show}>
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs  hidden-sm"> {this.getIntlMessage('global.back')}</span>
            </a>
            <h2 className="h4 opinion__header__title"> {opinion.parent.type.title}</h2>
          </div>
          <OpinionPreview opinion={opinion} />
        </div>
        <div className="opinion__description">
          <div dangerouslySetInnerHTML={{__html: htmlBody}} />
          <div className="opinion__buttons" style={{marginBottom: 0}}>
            <OpinionButtons {...this.props} opinion={opinion} />
          </div>
          <Row style={{borderTop: 'black solid', marginTop: 5}}>
            <Col sm={12} mdOffset={1} md={3} >
              <VotePiechart  top={20} height={180} ok={opinion.votes_ok} nok={opinion.votes_nok} mitige={opinion.votes_mitige} />
            </Col>
            <Col sm={12} md={5} style={{marginTop: 60}}>
              <Row>
              {
                this.props.opinion.votes.map((vote, index) => {
                  if (index < 10) {
                    return <UserAvatar user={vote.user} />;
                  }
                })
              }
              </Row>
              <Row>
                <FormattedMessage message={this.getIntlMessage('global.votes')} num={this.props.opinion.votes.length} />
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );
  },

});

export default OpinionBox;
