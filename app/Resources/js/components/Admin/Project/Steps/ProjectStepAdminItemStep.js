// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { ButtonToolbar, Button, Row, Col } from 'react-bootstrap';

import { type Step } from './ProjectStepAdminList';
import DeleteModal from '~/components/Modal/DeleteModal';
import ProjectAdminStepFormModal from '../Step/ProjectAdminStepFormModal';

type Props = {|
  step: Step,
  index: number,
  formName: string,
  fields: { length: number, map: Function, remove: Function },
  handleClickEdit?: (index: number, type: any) => void,
  handleClickDelete?: (index: number, type: any) => void,
|};

const ItemQuestionWrapper = styled.div`
  padding-right: 8px;
`;

const onDeleteStep = (fields, index) => {
  fields.remove(index);
};

export default function ProjectStepAdminItemStep(props: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { step, index, fields, formName } = props;

  return (
    <Row>
      <Col xs={8} className="d-flex align-items-center">
        <ItemQuestionWrapper>
          <i className="cap cap-android-menu" style={{ color: '#0388cc', fontSize: '20px' }} />
        </ItemQuestionWrapper>
        <ItemQuestionWrapper>
          <strong>{step.title}</strong>
          <br />
          <span className="excerpt">
            {step.type && <FormattedMessage id={`${step.type}_step`} />}
          </span>
        </ItemQuestionWrapper>
      </Col>
      <Col xs={4}>
        <ButtonToolbar className="pull-right">
          <Button
            bsStyle="warning"
            onClick={() => setShowEditModal(true)}
            id={`js-btn-edit-${index}`}
            className="btn-edit btn-outline-warning">
            <i className="fa fa-pencil" />
          </Button>
          <Button
            bsStyle="danger"
            id={`js-btn-delete-${index}`}
            className="btn-outline-danger"
            onClick={() => setShowDeleteModal(true)}>
            <i className="cap cap-times" />
          </Button>
          <ProjectAdminStepFormModal
            onClose={() => setShowEditModal(false)}
            step={step}
            show={showEditModal}
            form={formName}
            index={index}
          />
          <DeleteModal
            showDeleteModal={showDeleteModal}
            deleteElement={() => onDeleteStep(fields, index)}
            closeDeleteModal={() => setShowDeleteModal(false)}
            deleteModalTitle="group.admin.step.modal.delete.title"
            deleteModalContent="group.admin.step.modal.delete.content"
          />
        </ButtonToolbar>
      </Col>
    </Row>
  );
}
