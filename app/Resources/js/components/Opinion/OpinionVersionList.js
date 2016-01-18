import OpinionVersion from './OpinionVersion';

const OpinionVersionList = React.createClass({
  propTypes: {
    versions: React.PropTypes.array.isRequired,
    rankingThreshold: React.PropTypes.number,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.versions.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1"></i>
          <br/>
          { this.getIntlMessage('opinion.no_new_version') }
        </p>
      );
    }

    return (
      <ul className="media-list" style={{ marginTop: '20px'}}>
        {
          this.props.versions.map((version) => {
            return <OpinionVersion key={version.id} version={version} rankingThreshold={this.props.rankingThreshold} />;
          })
        }
      </ul>
    );
  },

});

export default OpinionVersionList;
