import OpinionBodyDiffModal from './OpinionBodyDiffModal';

const OpinionBodyDiffContent = React.createClass({
  propTypes: {
    html: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const html = this.props.html;

    if (html.indexOf('<span') === -1) { // no link detected
      return <div dangerouslySetInnerHTML={{__html: html}} />;
    }

    const sections = [];

    this.props.html.split('<p>').forEach((sentence) => {
      if (sentence.length > 0) {
        sections.push(sentence.replace('</p>', ''));
      }
    });

    const parts = [];
    sections.forEach((section) => {
      if (section.indexOf('<span') == -1) {
        parts.push({
          content: section,
          link: false,
        });
      } else {
        parts.push({
          before: section.slice(0, section.indexOf('<span')),
          link: section.slice(section.indexOf('data-diff-stop="">') + 'data-diff-stop="">'.length, section.indexOf('</span>')),
          after: section.slice(section.indexOf('</span>') + '</span>'.length),
          modal: {
            title: section.substring(section.lastIndexOf('data-diff-title="') + 'data-diff-title="'.length, section.lastIndexOf('" data-diff-before=')),
            before: section.substring(section.lastIndexOf('data-diff-before="') + 'data-diff-before="'.length, section.lastIndexOf('" data-diff-after=')),
            after: section.substring(section.lastIndexOf('data-diff-after="') + 'data-diff-after="'.length, section.lastIndexOf('" data-diff-stop')),
          }
        });
      }
    });

    return (
      <div>
        {
          parts.map((part) => {
            if (!part.link) {
              return <p dangerouslySetInnerHTML={{__html: part.content}}></p>;
            }
            return (
              <p>
                <span dangerouslySetInnerHTML={{__html: part.before}} />
                <OpinionBodyDiffModal link={part.link} modal={part.modal} />
                <span dangerouslySetInnerHTML={{__html: part.after}} />
              </p>
            );
          })
        }
      </div>
    );
  },
});

export default OpinionBodyDiffContent;
