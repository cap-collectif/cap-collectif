import OpinionPreview from './OpinionPreview';
import VotePiechart from '../Utils/VotePiechart';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionVersion = React.createClass({
  propTypes: {
    version: React.PropTypes.object.isRequired,
  },

  render() {
    const version = this.props.version;
    return (
      <li className="opinion block--bordered has-chart">
        <Row>
          <Col xs={12} sm={8} md={9} lg={10}>
            <OpinionPreview opinion={version} />
          </Col>
          <Col sm={4} md={3} lg={2} className="hidden-xs">
            <VotePiechart top={10} height={90} width={145} ok={version.votes_ok} nok={version.votes_nok} mitige={version.votes_mitige} />
          </Col>
        </Row>
      </li>
    );
  },

});

export default OpinionVersion;
