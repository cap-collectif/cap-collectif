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

    let sections = [];

    this.props.html.split('<p>').forEach((sentence) => {
      if (sentence.length > 0) {
        sections.push(sentence.replace('</p>', ''));
      }
    })

    let parts = [];
    sections.forEach((section) => {
      parts.push({
        before: section.slice(0, section.indexOf('<span')),
        link: section.slice(section.indexOf('>') + 1,section.indexOf('</span>')),
        after: section.slice(section.indexOf('</span>') + 7),
        modal: {
          title: section.substring(section.lastIndexOf('data-diff-title="') + 'data-diff-title="'.length, section.lastIndexOf('" data-diff-before=')),
          before: section.substring(section.lastIndexOf('data-diff-before="') + 'data-diff-before="'.length, section.lastIndexOf('" data-diff-after=')),
          after: section.substring(section.lastIndexOf('data-diff-after="') + 'data-diff-after="'.length, section.lastIndexOf('" data-diff-stop')),
        }
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
                <OpinionBodyDiffModal link={part.link} modal={part.modal} />
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
