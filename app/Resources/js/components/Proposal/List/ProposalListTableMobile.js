import * as React from 'react';
import { Label, ListGroup, ListGroupItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import ProgressList from '../../Ui/List/ProgressList';

type Props = {
  data: Array<Object>,
};

export class ProposalListTableMobile extends React.Component<Props> {

  getPhaseTitle = (phase: Array<Object>): string => {
    const openPhase = phase.filter(e => moment().isBetween(e.startAt, e.endAt));
    const toComePhase = phase.filter(e => moment().isBefore(e.startAt));
    const endPhase = phase[phase.length - 1];

    if (openPhase.length > 0) {
      return openPhase[0].title;
    }

    if (toComePhase.length > 0) {
      return toComePhase[0].title;
    }

    if (endPhase) {
      return endPhase.title;
    }
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

          const getStatus = () => {
            if (item.status.value && item.status.value.name.length > 9) {
              const tooltip = (
                <Tooltip placement="top" id="tooltip">
                  {item.status.value.name}
                </Tooltip>
              );

              return (
                <OverlayTrigger overlay={tooltip} placement="top">
                  <Label bsStyle={item.status.value.color} className="badge-pill">
                    {item.status.value.name.substring(0, 9)}...
                  </Label>
                </OverlayTrigger>
              );
            }

            if (item.status.value) {
              return (
                <Label bsStyle={item.status.value.color} className="badge-pill">
                  {item.status.value.name}
                </Label>
              );
            }
          };

          return (
            <ListGroupItem>
              <div>
                <div className="d-flex justify-content-between">
                  {item.title.value && <a href={item.title.value.url}>{getProposalTitle}</a>}
                  {item.status.value && <div className="ml-5">{getStatus()}</div>}
                </div>
                {item.implementationPhase.value && (
                  <div className="m-auto">
                    {this.getPhaseTitle(item.implementationPhase.value.list) && (
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
    )
  }
}

export default ProposalListTableMobile;
