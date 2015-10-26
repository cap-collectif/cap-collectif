import OpinionPreview from '../OpinionPreview';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionLink = React.createClass({
  propTypes: {
    link: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const link = this.props.link;
    const classes = classNames({
      'opinion': true,
      'block--bordered': true,
      'bg-vip': link.author.vip,
    });

    return (
      <li className={classes} >
        <Row>
          <Col xs={12}>
            <OpinionPreview opinion={link} showTypeLabel />
          </Col>
        </Row>
      </li>
    );
  },

});

export default OpinionLink;
