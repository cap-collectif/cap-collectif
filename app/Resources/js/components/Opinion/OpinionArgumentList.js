import OpinionArgumentItem from './OpinionArgumentItem';

const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionArgumentList = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  render() {
    const classes = 'block--tablet block--bordered opinion__arguments--' + this.props.type;
    return (
      <div className={classes}>
        <div className="opinion__arguments__header row">
          <h4 className="col-xs-6 col-sm-12 col-md-6 h4 opinion__header__title">
            {this.props.type === 'yes'
              ? <FormattedMessage message={this.getIntlMessage('argument.yes.list')} num={this.props.opinion.arguments_yes_count} />
              : <FormattedMessage message={this.getIntlMessage('argument.no.list')} num={this.props.opinion.arguments_no_count} />
            }
          </h4>
        </div>
        <ul className="media-list opinion__list">
        {
          this.props.opinion.arguments.map((argument) => {
            if (this.props.type === 'yes' && argument.type === 1) {
              return <OpinionArgumentItem {...this.props} key={argument.id} argument={argument} />;
            }
            if (this.props.type === 'no' && argument.type === 0) {
              return <OpinionArgumentItem {...this.props} key={argument.id} argument={argument} />;
            }
          })
        }
      </ul>
    </div>
    );
  },
});

export default OpinionArgumentList;
