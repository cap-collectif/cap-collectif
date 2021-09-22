// @flow
import * as React from 'react';
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import component from '~/components/Form/Field';
import type { GlobalState } from '~/types';
import type { DashboardFilters_viewer$key } from '~relay/DashboardFilters_viewer.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';
import { useDashboard, type Filters } from '~/components/Admin/Dashboard/DashboardPage.context';

const FRAGMENT = graphql`
  fragment DashboardFilters_viewer on User
  @argumentDefinitions(affiliations: { type: "[ProjectAffiliation!]" })
  {
    projects(affiliations: $affiliations)
    {
      totalCount
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

type ReduxProps = {|
  +startAt: string,
  +endAt: string,
|};

type ComponentProps = {|
  +viewer: DashboardFilters_viewer$key,
  +defaultFilters: Filters,
|};

type Props = {|
  ...ReduxProps,
  ...ComponentProps,
|};

export const formName = 'form-filters-dashboard';

const DashboardFilters = ({ viewer: viewerFragment, startAt, endAt }: Props): React.Node => {
  const viewer = useFragment(FRAGMENT, viewerFragment);
  const intl = useIntl();
  const { setFilters, isAdmin } = useDashboard();
  const { projects } = viewer;

  return (
    <AppBox
      as="form"
      id={formName}
      css={{
        '.form-group': {
          marginBottom: 0,
        },
      }}>
      <Flex direction="row" align="center" spacing={2}>
        <AppBox maxWidth="200px">
          <Field
            type="select"
            id="project"
            name="project"
            component={component}
            onChange={(e: SyntheticInputEvent<HTMLSelectElement>, value: string) =>
              setFilters('projectId', value)
            }>

            {
              isAdmin && (
                <option value="ALL">{intl.formatMessage({ id: 'global.all.projects' })}</option>
              )
            }

            {projects?.totalCount > 0 &&
              projects?.edges
                ?.filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
          </Field>
        </AppBox>

        <Flex direction="row" justify="space-between" spacing={1} align="center">
          <Text>{intl.formatMessage({ id: 'global.from' })}</Text>
          <Field
            id="startAt"
            name="startAt"
            type="datetime"
            component={component}
            addonAfter={<i className="cap-calendar-2" />}
            onChange={(e: SyntheticInputEvent<HTMLInputElement>, value: string) =>
              setFilters('startAt', value)
            }
            dateProps={{
              closeOnSelect: true,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: false,
              initialViewDate: startAt,
            }}
            disableValidation
          />
          <Text>{intl.formatMessage({ id: 'global.to' })}</Text>
          <Field
            id="endAt"
            name="endAt"
            type="datetime"
            component={component}
            addonAfter={<i className="cap-calendar-2" />}
            onChange={(e: SyntheticInputEvent<HTMLInputElement>, value: string) =>
              setFilters('endAt', value)
            }
            dateProps={{
              closeOnSelect: true,
              dateFormat: 'MM/DD/YYYY',
              timeFormat: false,
              initialViewDate: endAt,
            }}
            disableValidation
            closeOnSelect
          />
        </Flex>
      </Flex>
    </AppBox>
  );
};

const DashboardFiltersForm = reduxForm({
  form: formName,
})(DashboardFilters);

const mapStateToProps = (state: GlobalState, props: ComponentProps) => ({
  initialValues: {
    startAt: props.defaultFilters.startAt,
    endAt: props.defaultFilters.endAt,
    project: props.defaultFilters.projectId,
  },
  startAt: formValueSelector(formName)(state, 'startAt'),
  endAt: formValueSelector(formName)(state, 'endAt'),
});

export default (connect<any, any, _, _, _, _>(mapStateToProps)(
  DashboardFiltersForm,
): React.AbstractComponent<ComponentProps>);
