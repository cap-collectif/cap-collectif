import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionSourceButtons from './OpinionSourceButtons';

const Label = ReactBootstrap.Label;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionSource = React.createClass({
  propTypes: {
    source: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const source = this.props.source;
    return (
      <li className="opinion block--bordered has-chart">
        <Row>
          <Col xs={12}>
            <div className="opinion__body box">
              <UserAvatar user={source.author} className="pull-left" />
              <div className="opinion__data">
                <OpinionInfos opinion={source} />
                <h3 className="opinion__title">
                  <Label bsStyle="primary">{ source.category.title }</Label>
                  <a href={source.link}>
                    { source.title }
                  </a>
                </h3>
                <p className="excerpt">
                  { source.body }
                </p>
                <p className="opinion__votes excerpt small">
                  <OpinionSourceButtons source={source} />
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </li>
    );
  },

});

export default OpinionSource;
