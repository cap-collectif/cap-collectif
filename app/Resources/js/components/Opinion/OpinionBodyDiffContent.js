// @flow
import * as React from 'react';
import OpinionBodyDiffModal from './OpinionBodyDiffModal';

const OpinionBodyDiffContent = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },

  render() {
    const opinion = this.props.opinion;

    if (opinion.modals.length < 1) {
      return <div dangerouslySetInnerHTML={{ __html: opinion.body }} />;
    }

    const modals = opinion.modals;
    const sections = [];

    opinion.body.split('<p>').forEach(sentence => {
      if (sentence.length > 0) {
        sections.push(sentence.replace('</p>', ''));
      }
    });

    const parts = [];
    sections.forEach(section => {
      let foundModal = false;
      modals.forEach(modal => {
        if (section.indexOf(modal.key) !== -1) {
          foundModal = modal;
        }
      });
      if (!foundModal) {
        parts.push({
          content: section,
          link: false,
        });
      } else {
        parts.push({
          before: section.slice(0, section.indexOf(foundModal.key)),
          link: foundModal.key,
          after: section.slice(
            section.indexOf(foundModal.key) + foundModal.key.length,
          ),
          modal: foundModal,
        });
      }
    });

    return (
      <div>
        {parts.map((part, index) => {
          if (!part.link) {
            return <p dangerouslySetInnerHTML={{ __html: part.content }} />;
          }
          return (
            <p key={index}>
              <span dangerouslySetInnerHTML={{ __html: part.before }} />
              <OpinionBodyDiffModal link={part.link} modal={part.modal} />
              <span dangerouslySetInnerHTML={{ __html: part.after }} />
            </p>
          );
        })}
      </div>
    );
  },
});

export default OpinionBodyDiffContent;
