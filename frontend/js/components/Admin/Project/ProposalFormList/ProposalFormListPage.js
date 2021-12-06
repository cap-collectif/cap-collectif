// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import Text from '~ui/Primitives/Text';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Flex from '~ui/Primitives/Layout/Flex';
import ModalCreateProposalForm from './ModalCreateProposalForm';
import Input from '~ui/Form/Input/Input';
import ProposalFormList from './ProposalFormList';
import ProposalFormListPlaceholder from './ProposalFormListPlaceholder';
import type { ProposalFormListPageQuery as ProposalFormListPageQueryType } from '~relay/ProposalFormListPageQuery.graphql';
import NoResult from '~/components/Admin/Project/ProposalFormList/NoResult';
import Button from '~ds/Button/Button';
import type { ProposalFormList_viewer$ref } from '~relay/ProposalFormPaginationQuery.graphql';

type Props = {|
  +queryReference: PreloadedQuery<ProposalFormListPageQueryType>,
  +isAdmin: boolean,
|};

export type Viewer = {|
  +id: string,
  +username: ?string,
  +__typename: string,
  +allProposalForm: {|
    +totalCount: number,
  |},
  +$fragmentRefs: ProposalFormList_viewer$ref,
|};

export const ProposalFormListPageQuery: GraphQLTaggedNode = graphql`
  query ProposalFormListPageQuery(
    $count: Int
    $cursor: String
    $term: String
    $affiliations: [ProposalFormAffiliation!]
    $orderBy: ProposalFormOrder
  ) {
    viewer {
      id
      username
      __typename
      allProposalForm: proposalForms(affiliations: $affiliations) {
        totalCount
      }
      ...ProposalFormList_viewer
        @arguments(
          count: $count
          cursor: $cursor
          term: $term
          affiliations: $affiliations
          orderBy: $orderBy
        )
    }
  }
`;

const ProposalFormListPage = ({ queryReference, isAdmin }: Props): React.Node => {
  const intl = useIntl();
  const [term, setTerm] = React.useState<string>('');
  const [orderBy, setOrderBy] = React.useState('DESC');
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const query = usePreloadedQuery<ProposalFormListPageQueryType>(
    ProposalFormListPageQuery,
    queryReference,
  );

  const hasProposalForm = query.viewer.allProposalForm.totalCount > 0;
  return (
    <Flex direction="column">
      <Text
        color="blue.800"
        {...headingStyles.h4}
        fontWeight={FontWeight.Semibold}
        px={6}
        py={4}
        bg="white">
        {intl.formatMessage({ id: 'admin.label.proposal_form' })}
      </Text>

      {hasProposalForm ? (
        <Flex
          direction="column"
          p={8}
          spacing={4}
          m={6}
          bg="white"
          borderRadius="normal"
          overflow="hidden">
          <Flex direction="row" spacing={8}>
            <>
              <Button
                variant="primary"
                variantColor="primary"
                variantSize="small"
                leftIcon="ADD"
                id="btn-add-proposalForm"
                onClick={onOpen}>
                {intl.formatMessage({ id: 'create-form' })}
              </Button>
              <ModalCreateProposalForm
                viewer={query.viewer}
                intl={intl}
                isAdmin={isAdmin}
                term={term}
                orderBy={orderBy}
                onClose={onClose}
                show={isOpen}
                hasProposalForm={hasProposalForm}
              />
            </>

            <Input
              type="text"
              name="term"
              id="search-form"
              onChange={(e: SyntheticInputEvent<HTMLInputElement>) => setTerm(e.target.value)}
              value={term}
              placeholder={intl.formatMessage({ id: 'search-form' })}
            />
          </Flex>

          <React.Suspense fallback={<ProposalFormListPlaceholder />}>
            <ProposalFormList
              viewer={query.viewer}
              term={term}
              isAdmin={isAdmin}
              resetTerm={() => setTerm('')}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <NoResult
          isAdmin={isAdmin}
          viewer={query.viewer}
          term={term}
          orderBy={orderBy}
          hasProposalForm={hasProposalForm}
        />
      )}
    </Flex>
  );
};

export default ProposalFormListPage;
