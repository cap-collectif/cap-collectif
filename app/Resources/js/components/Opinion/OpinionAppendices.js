import OpinionAppendix from './OpinionAppendix';

const OpinionAppendices = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const opinion = this.props.opinion;

    if (this.isVersion() || !this.hasAppendices()) {
      return null;
    }

    return (
      <div className="opinion__description">
        {
          opinion.appendices.map((appendix, index) => {
            if (appendix.body) {
              return (
                <OpinionAppendix appendix={appendix} expanded={index === 0} />
              );
            }
          })
        }
      </div>
    );
  },

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },

  hasAppendices() {
    return this.props.opinion.appendices.some( (app) => {
      if (app.body) {
        return true;
      }
      return false;
    });
  },

});

export default OpinionAppendices;


