import OpinionVersion from './OpinionVersion';

const OpinionVersionList = React.createClass({
  propTypes: {
    versions: React.PropTypes.array,
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

    const classes = React.addons.classSet({
      'media-list': true,
      'opinion__list': true,
    });

    return (
      <ul className={classes}>
        {
          this.props.versions.map((version) => {
            return <OpinionVersion {...this.props} key={version.id} version={version} />;
          })
        }
      </ul>
    );
  },

});

export default OpinionVersionList;
