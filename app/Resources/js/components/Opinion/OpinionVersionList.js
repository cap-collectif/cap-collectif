import OpinionVersion from './OpinionVersion';

const OpinionVersionList = React.createClass({
  propTypes: {
    versions: React.PropTypes.array,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.versions.length === 0) {
      return <p>Y en a pas :-'(</p>;
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
