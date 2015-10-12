import OpinionLink from './OpinionLink';

const OpinionLinkList = React.createClass({
  propTypes: {
    links: React.PropTypes.array.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.links.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1"></i>
          <br/>
          { this.getIntlMessage('opinion.no_new_link') }
        </p>
      );
    }

    return (
      <ul id="links-list" className="media-list" style={{ marginTop: '20px'}}>
        {
          this.props.links.map((link) => {
            return <OpinionLink {...this.props} key={link.id} link={link} />;
          })
        }
      </ul>
    );
  },

});

export default OpinionLinkList;
