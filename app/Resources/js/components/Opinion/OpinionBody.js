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
      let htmlBody = '';

      const diff = JsDiff.diffWords(opinion.parent.body, opinion.body);
      diff.forEach((part) => {
        const diffColor = part.added ? 'green' : part.removed ? 'red' : 'grey';
        const decoration = part.removed ? 'line-through' : 'none';
        htmlBody += '<span style="color: ' + diffColor + '; text-decoration: ' + decoration + '">' + part.value + '</span>';
      });

      return (
        <div>
          <div dangerouslySetInnerHTML={{__html: htmlBody}} />
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
            return (
              <TabPane eventKey={index + 2} tab={appendix.type.title}>
                <div dangerouslySetInnerHTML={{__html: appendix.body}} />
              </TabPane>
            );
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


