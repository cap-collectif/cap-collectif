import OpinionBodyDiffModal from './OpinionBodyDiffModal';

const OpinionBodyDiffContent = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const opinion = this.props.opinion;

    if (opinion.modals.length < 1) {
      return <div dangerouslySetInnerHTML={{__html: opinion.body}} />;
    }

    const modal = opinion.modals[0];
    const sections = [];

    opinion.body.split('<p>').forEach((sentence) => {
      if (sentence.length > 0) {
        sections.push(sentence.replace('</p>', ''));
      }
    });

    const parts = [];
    sections.forEach((section) => {
      if (section.indexOf(modal.key) === -1) {
        parts.push({
          content: section,
          link: false,
        });
      } else {
        parts.push({
          before: section.slice(0, section.indexOf(modal.key)),
          link: modal.key,
          after: section.slice(section.indexOf(modal.key) + modal.key.length),
          modal: modal,
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
