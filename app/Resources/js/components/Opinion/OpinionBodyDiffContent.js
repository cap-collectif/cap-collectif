import OpinionBodyDiffModal from './OpinionBodyDiffModal';

const OpinionBodyDiffContent = React.createClass({
  propTypes: {
    html: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const html = this.props.html;

    if (html.indexOf('<span') === -1) {
      return <div dangerouslySetInnerHTML={{__html: html}} />;
    }

    console.log(this.props.html);
    console.log(this.props.html.split('<p>'));

    let sections = [];

    this.props.html.split('<p>').forEach((sentence) => {
      if (sentence.length > 0) {
        sections.push(sentence.replace('</p>', ''));
      }
    })

    console.log(sections);

    let parts = [];
    sections.forEach((section) => {
      parts.push({
        before: section.slice(0, section.indexOf('<span')),
        link: section.slice(section.indexOf('>') + 1,section.indexOf('</span>')),
        after: section.slice(section.indexOf('</span>') + 7)
      });
    });

    return (
      <div>
        {
          parts.map((part) => {
            console.log(part);
            return (
              <p>
                <span dangerouslySetInnerHTML={{__html: part.before}} />
                <OpinionBodyDiffModal link={part.link} />
                <span dangerouslySetInnerHTML={{__html: part.after}} />
              </p>
            );
          })
        }
      </div>
    );;
  },
});

export default OpinionBodyDiffContent;
