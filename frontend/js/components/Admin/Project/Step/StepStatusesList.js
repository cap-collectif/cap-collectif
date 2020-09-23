// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup } from 'react-bootstrap';
import { Field, change, arrayRemove } from 'redux-form';
import InputRequirement from '~/components/Ui/Form/InputRequirement';
import type { StatusColor } from '~relay/UpdateProjectAlphaMutation.graphql';
import CircleColor, { type Color } from '~/components/Ui/CircleColor/CircleColor';
import { RequirementDragItem } from './ProjectAdminStepForm.style';
import { NoStepsPlaceholder } from '../Form/ProjectAdminForm.style';
import type { Dispatch } from '~/types';

export type Status = {|
  id?: ?string,
  name?: ?string,
  color?: ?StatusColor,
|};

type Props = {|
  ...ReduxFormFieldArrayProps,
  statuses: Array<Status>,
  dispatch: Dispatch,
  formName: string,
  meta?: {| error: ?string |},
  onInputChange: (value: string, color: string, field: string, status: Status) => void,
  onInputDelete: (index: number) => void,
|};

const colorsData: Array<Color> = [
  { label: 'global.primary', name: 'primary', hexValue: '#3b88fd' },
  { label: 'global.green', name: 'success', hexValue: '#399a39' },
  { label: 'global.orange', name: 'warning', hexValue: '#f4b721' },
  { label: 'global.red', name: 'danger', hexValue: '#f75d56' },
  { label: 'opinion_type.colors.blue', name: 'info', hexValue: '#77b5fe' },
  { label: 'opinion_type.colors.white', name: 'default', hexValue: '#fff' },
];

export function StepStatusesList({ fields, statuses, onInputChange, onInputDelete }: Props) {
  const intl = useIntl();
  return (
    <ListGroup>
      {fields.length === 0 && (
        <NoStepsPlaceholder>
          <FormattedMessage id="global.no_status" />
        </NoStepsPlaceholder>
      )}
      {fields.map((field: string, index: number) => {
        const status = statuses && statuses[index];
        if (!status) return;
        const defaultColor = status?.color
          ? colorsData.find(c => c.name === status.color)
          : colorsData[0];
        return (
          <RequirementDragItem key={index}>
            <CircleColor
              editable
              onChange={color => {
                onInputChange(status?.name || 'primary', color.name, field, statuses[index]);
              }}
              defaultColor={defaultColor || colorsData[0]}
              colors={colorsData}
            />
            <Field
              name={field}
              component={InputRequirement}
              props={{
                placeholder: intl.formatMessage({ id: 'enter-label' }),
                onChange: (value: string) => {
                  onInputChange(value, status.color || 'primary', field, statuses[index]);
                },
                onDelete: () => {
                  onInputDelete(index);
                },
                initialValue: status.name,
              }}
            />
          </RequirementDragItem>
        );
      })}
    </ListGroup>
  );
}

const mapDispatchToProps = (dispatch: Dispatch, props: Props) => ({
  onInputChange: (name: string, color: string, field: string, status: Status) => {
    dispatch(change(props.formName, field, { ...status, name, color }));
  },
  onInputDelete: (index: number) => {
    dispatch(arrayRemove(props.formName, 'statuses', index));
  },
  dispatch,
});

export default connect(null, mapDispatchToProps)(StepStatusesList);
