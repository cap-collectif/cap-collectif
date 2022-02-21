// @flow
import React from 'react';
import cn from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import NewLoginOverlay from '../Utils/NewLoginOverlay';
import OpinionCreateModal from './Create/OpinionCreateModal';
import { openOpinionCreateModal } from '../../redux/modules/opinion';
import type { NewOpinionButton_section } from '~relay/NewOpinionButton_section.graphql';
import type { NewOpinionButton_consultation } from '~relay/NewOpinionButton_consultation.graphql';
import type { Dispatch } from '../../types';

type Props = {|
  +section: NewOpinionButton_section,
  +consultation: NewOpinionButton_consultation,
  +label: string,
  +className: string,
  +dispatch: Dispatch,
|};

const NewOpinionButton = ({ dispatch, label, consultation, section, className }: Props) => {
  const disabled = !consultation.contribuable;

  return (
    <React.Fragment>
      <NewLoginOverlay>
        <button
          type="button"
          disabled={disabled}
          id={`btn-add--${section.slug}`}
          className={cn('btn btn-primary', className)}
          onClick={() => {
            dispatch(openOpinionCreateModal(section.id));
          }}>
          <i className="cap cap-add-1" />
          <span className="hidden-xs">{label}</span>
        </button>
      </NewLoginOverlay>
      <OpinionCreateModal section={section} consultation={consultation} />
    </React.Fragment>
  );
};

const container = connect<any, any, _, _, _, _>()(NewOpinionButton);

export default createFragmentContainer(container, {
  section: graphql`
    fragment NewOpinionButton_section on Section {
      id
      slug
      ...OpinionCreateModal_section
    }
  `,
  consultation: graphql`
    fragment NewOpinionButton_consultation on Consultation
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      ...OpinionCreateModal_consultation @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
