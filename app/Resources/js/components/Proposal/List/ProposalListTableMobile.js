import * as React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import ProgressList from '../../Ui/List/ProgressList';
import CroppedLabel from '../../Ui/CroppedLabel';
import ImplementationPhaseTitle from '../ImplementationPhaseTitle';

type Props = {
  data: Array<Object>,
};

export class ProposalListTableMobile extends React.Component<Props> {
  getPhaseTitle = (phases: Array<Object>): string => {
    return <ImplementationPhaseTitle phases={phases} />;
  };

  render() {
    const { data } = this.props;

    return (
      <ListGroup className="list-group-custom">
        {data.map(item => {
          const list =
            item.implementationPhase.value &&
            item.implementationPhase.value.list.map(e => {
              let isActive = false;

              if (moment().isAfter(e.endAt)) {
                isActive = true;
              }

              return {
                title: e.title,
                isActive,
              };
            });

          const getProposalTitle =
            item.title.value.displayTitle.length > 45
              ? `${item.title.value.displayTitle.substring(0, 45)}...`
              : item.title.value.displayTitle;

          return (
            <ListGroupItem>
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  {item.title.value && <a href={item.title.value.url}>{getProposalTitle}</a>}
                  {item.status.value && (
                    <div className="ml-5">
                      <CroppedLabel label={item.status.value} className="badge-pill" />
                    </div>
                  )}
                </div>
                {item.implementationPhase.value && (
                  <div className="m-auto">
                    {item.implementationPhase.value.list.length > 0 && (
                      <div className="mb-5 mt-10">
                        <span>{this.getPhaseTitle(item.implementationPhase.value.list)}</span>
                      </div>
                    )}
                    <ProgressList progressListItem={list} />
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
