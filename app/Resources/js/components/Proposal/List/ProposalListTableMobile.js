// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import ProgressList from '../../Ui/List/ProgressList';
import CroppedLabel from '../../Ui/Labels/CroppedLabel';
import ImplementationStepTitle from '../ImplementationStepTitle';
import ProgressListItem from '../../Ui/List/ProgressListItem';
import type { ImplementationStepTitle_progressSteps } from '~relay/ImplementationStepTitle_progressSteps.graphql';
import ListGroup from '../../Ui/List/ListGroup';

type Props = {
  data: Array<Object>,
};

export class ProposalListTableMobile extends React.Component<Props> {
  getPhaseTitle = (progressSteps: ImplementationStepTitle_progressSteps) => (
    <ImplementationStepTitle progressSteps={progressSteps} />
  );

  render() {
    const { data } = this.props;

    return (
      <ListGroup>
        {data.map((item, key) => {
          const { value } = item.implementationPhase;
          const openSteps = value.list.filter(step => moment().isBetween(step.startAt, step.endAt));
          const openTimelessSteps = value.list.filter(
            step => !step.endAt && moment().isAfter(step.startAt),
          );

          const list =
            item.implementationPhase.value &&
            item.implementationPhase.value.list.map(step => {
              let isActive = false;

              if (moment().isAfter(step.endAt)) {
                isActive = true;
              }

              if (
                !step.endAt &&
                moment().isAfter(step.startAt) &&
                (openSteps.length !== 0 ||
                  (openSteps.length === 0 &&
                    openTimelessSteps.length > 1 &&
                    openTimelessSteps[openTimelessSteps.length - 1].title !== step.title))
              ) {
                isActive = true;
              }

              return {
                title: step.title,
                isActive,
              };
            });

          const getProposalTitle =
            item.title.value.displayTitle.length > 45
              ? `${item.title.value.displayTitle.substring(0, 45)}...`
              : item.title.value.displayTitle;

          return (
            <ListGroupItem key={key}>
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  {item.title.value && <a href={item.title.value.url}>{getProposalTitle}</a>}
                  {item.status.value && (
                    <div className="ml-5">
                      <CroppedLabel label={item.status.value} className="badge-pill" />
                    </div>
                  )}
                </div>
                {item.implementationPhase.value && item.implementationPhase.value.list.length > 0 && (
                  <div className="m-auto">
                    <div className="mb-5 mt-10">
                      <span>{this.getPhaseTitle(item.implementationPhase.value.list)}</span>
                    </div>
                    <ProgressList>
                      {list.map((element, liKey) => (
                        <ProgressListItem key={liKey} item={element} />
                      ))}
                    </ProgressList>
                  </div>
                )}
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    );
  }
}

export default ProposalListTableMobile;
