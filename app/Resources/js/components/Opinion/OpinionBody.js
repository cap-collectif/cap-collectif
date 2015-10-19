import CustomDiff from '../../services/CustomDiff';
import OpinionBodyDiffContent from './OpinionBodyDiffContent';

const Well = ReactBootstrap.Well;

const OpinionBody = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  isVersion() {
    return !!this.props.opinion.parent;
  },

  hasLink() {
    return !!this.props.opinion.link;
  },

  render() {
    const opinion = this.props.opinion;

    if (this.isVersion()) {
      const prettyDiff = CustomDiff.prettyDiff(opinion.parent.body, opinion.body);

      return (
        <div>
          {opinion.comment !== null
            ? <div>
                <p className="control-label h5">
                  {this.getIntlMessage('opinion.version_comment')}
                </p>
                <Well bsSize="small">
                  <div dangerouslySetInnerHTML={{__html: opinion.comment}} />
                </Well>
              </div>
            : null
          }
          <div dangerouslySetInnerHTML={{__html: prettyDiff}} />
        </div>
      );
    }

    if (this.hasLink()) {
      return (
        <div>
          <div>
            <p className="control-label h5">
              {this.getIntlMessage('opinion.link.opinion')}
              { ' ' }
              <a href={this.props.opinion.link._links.show}>
                {this.props.opinion.link.title}
              </a>
            </p>
            <br />
          </div>
          <OpinionBodyDiffContent opinion={opinion} />
        </div>
      );
    }

    return <OpinionBodyDiffContent opinion={opinion} />;
  },

});

export default OpinionBody;


