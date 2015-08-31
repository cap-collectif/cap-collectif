import CustomDiff from '../../services/CustomDiff';

const TabbedArea = ReactBootstrap.TabbedArea;
const TabPane = ReactBootstrap.TabPane;
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

    if (!this.hasAppendices()) {
      return <div dangerouslySetInnerHTML={{__html: opinion.body}} />;
    }

    return (
      <TabbedArea defaultActiveKey={1} bsStyle="pills" className="nav-center">
        <TabPane eventKey={1} tab={this.getIntlMessage('global.content')}>
          <div dangerouslySetInnerHTML={{__html: opinion.body}} />
        </TabPane>
        {
          opinion.appendices.map((appendix, index) => {
            if (appendix.body) {
              return (
                <TabPane eventKey={index + 2} tab={appendix.type.title}>
                  <div dangerouslySetInnerHTML={{__html: appendix.body}}/>
                </TabPane>
              );
            }
          })
        }
      </TabbedArea>
    );
  },

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },

  hasAppendices() {
    return this.props.opinion.appendices.length >= 1;
  },

});

export default OpinionBody;


