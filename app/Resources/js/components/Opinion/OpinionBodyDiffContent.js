// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionBodyDiffModal from './OpinionBodyDiffModal';
import type { OpinionBodyDiffContent_opinion } from '~relay/OpinionBodyDiffContent_opinion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  opinion: OpinionBodyDiffContent_opinion,
};

class OpinionBodyDiffContent extends React.Component<Props> {
  render() {
    const { opinion } = this.props;

    if (!opinion.modals || opinion.modals.length < 1) {
      return <WYSIWYGRender className="mb-15" value={opinion.body} />;
    }

    const { modals } = opinion;
    const sections = [];

    if (opinion.body) {
      opinion.body.split('<p>').forEach(sentence => {
        if (sentence.length > 0) {
          sections.push(sentence.replace('</p>', ''));
        }
      });
    }
    const parts = [];
    sections.forEach(section => {
      let foundModal = false;
      modals.forEach(modal => {
        if (modal && section.indexOf(modal.key) !== -1) {
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
          after: section.slice(section.indexOf(foundModal.key) + foundModal.key.length),
          modal: foundModal,
        });
      }
    });

    return (
      <div>
        {parts.map((part, index) => {
          if (!part.link) {
            return <WYSIWYGRender value={part.content} />;
          }
          return (
            <p key={index}>
              <WYSIWYGRender value={part.before} tagName="span" />
              <OpinionBodyDiffModal link={part.link} modal={part.modal} />
              <WYSIWYGRender value={part.after} tagName="span" />
            </p>
          );
        })}
      </div>
    );
  }
}

export default createFragmentContainer(OpinionBodyDiffContent, {
  opinion: graphql`
    fragment OpinionBodyDiffContent_opinion on OpinionOrVersion {
      ... on Opinion {
        body
        trashedStatus
        modals {
          key
          before
          after
          ...OpinionBodyDiffModal_modal
        }
      }
    }
  `,
});
