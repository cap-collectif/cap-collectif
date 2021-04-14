// @flow
import React, { useEffect } from 'react';
import { Field } from 'redux-form';
import { graphql, usePaginationFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import renderComponent from '~/components/Form/Field';
import AppBox from '~ui/Primitives/AppBox';
import * as S from '~/components/Admin/Section/HomePageProjectsSectionAdminPage.style';
import Flex from '~ui/Primitives/Layout/Flex';
import type { HomePageProjectsSectionAdminPageDisplayMostRecentQuery } from '~relay/HomePageProjectsSectionAdminPageDisplayMostRecentQuery.graphql';
import type { HomePageProjectsSectionAdminPageDisplayMostRecent_query$key } from '~relay/HomePageProjectsSectionAdminPageDisplayMostRecent_query.graphql';
import type { HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin } from '~relay/HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin.graphql';

type Props = {|
  +projectsFragments: HomePageProjectsSectionAdminPageDisplayMostRecent_query$key,
  +homePageProjectsSectionAdmin: HomePageProjectsSectionAdminPage_homePageProjectsSectionAdmin,
  +maxProjectsDisplay: number,
|};

const imagePlaceholder = (
  <svg width="112" height="69" viewBox="0 0 112 69" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="112" height="69" rx="4" fill="#F7F7F8" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M44 27.3808C44 26.434 44.7675 25.6665 45.7143 25.6665H66.2857C67.2325 25.6665 68 26.434 68 27.3808V44.5236C68 45.4704 67.2325 46.2379 66.2857 46.2379H45.7143C44.7675 46.2379 44 45.4704 44 44.5236V27.3808ZM47.4286 29.0951V42.8094H64.5714V29.0951H47.4286ZM50.8571 34.2379C51.8039 34.2379 52.5714 33.4704 52.5714 32.5236C52.5714 31.5769 51.8039 30.8093 50.8571 30.8093C49.9104 30.8093 49.1428 31.5769 49.1428 32.5236C49.1428 33.4704 49.9104 34.2379 50.8571 34.2379ZM49.1428 39.3808V41.0951H62.8571V35.9522L59.4286 32.5237L54.2857 37.6665L52.5714 35.9522L49.1428 39.3808Z"
      fill="#85919D"
    />
  </svg>
);

// TODO @spyl94 test this component
export const HomePageProjectsSectionAdminPageDisplayMostRecent = ({
  projectsFragments,
  homePageProjectsSectionAdmin,
  maxProjectsDisplay,
}: Props) => {
  const intl = useIntl();

  const { data: projectsData, refetch } = usePaginationFragment<
    HomePageProjectsSectionAdminPageDisplayMostRecentQuery,
    _,
  >(
    graphql`
      fragment HomePageProjectsSectionAdminPageDisplayMostRecent_query on Query
        @refetchable(queryName: "HomePageProjectsSectionAdminPageDisplayMostRecentQuery")
        @argumentDefinitions(first: { type: "Int", defaultValue: 3 }, cursor: { type: "String" }) {
        projects(first: $first, after: $cursor)
          @connection(key: "HomePageProjectsSectionAdminPageDisplayMostRecent_projects") {
          edges {
            node {
              id
              title
              cover {
                url
              }
            }
          }
        }
      }
    `,
    projectsFragments,
  );

  useEffect(() => {
    refetch({ first: homePageProjectsSectionAdmin.nbObjects });
  }, [homePageProjectsSectionAdmin.nbObjects, refetch]);

  return (
    <>
      <Field
        type="number"
        name="nbObjects"
        id="nbObjects"
        label={intl.formatMessage({ id: 'projects-number' })}
        component={renderComponent}
        onChange={event => {
          const { value } = event.target;
          if (value > 0 && value <= maxProjectsDisplay) {
            refetch({ first: value }, { fetchPolicy: 'store-and-network' });
          }
        }}
        max={maxProjectsDisplay}
        min={1}
      />
      <AppBox>
        {projectsData?.projects?.edges?.map(project => {
          return (
            <S.ProjectCard key={project?.node?.id}>
              <Flex direction="row" alignContent="center">
                {project?.node?.cover === null ? (
                  imagePlaceholder
                ) : (
                  <img src={project?.node?.cover?.url} alt={project?.node?.title} />
                )}
                <p>{project?.node?.title}</p>
              </Flex>
            </S.ProjectCard>
          );
        })}
      </AppBox>
    </>
  );
};

export default HomePageProjectsSectionAdminPageDisplayMostRecent;
