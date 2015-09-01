import CustomDiff from '../../services/CustomDiff';

const Panel = ReactBootstrap.Panel;

const OpinionBody = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const opinion = this.props.opinion;

    if (this.isVersion()) {
      const prettyDiff = CustomDiff.prettyDiff(opinion.parent.body, opinion.body);

      return (
        <div>
          <div dangerouslySetInnerHTML={{__html: prettyDiff}} />
          {opinion.comment !== null
            ? <Panel header={this.getIntlMessage('global.comment')} style={{marginTop: 20}}>
                <div dangerouslySetInnerHTML={{__html: opinion.comment}} />
              </Panel>
            : <span />
          }
        </div>
      );
    }

    return <div dangerouslySetInnerHTML={{__html: opinion.body}} />;
  },

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },

});

export default OpinionBody;


