<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\AppBundle\Search\Search;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class SelectionStepProposalResolver implements ResolverInterface
{
    private LoggerInterface $logger;
    private ProposalSearch $proposalSearch;

    public function __construct(ProposalSearch $proposalSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->proposalSearch = $proposalSearch;
    }

    public function __invoke(
        SelectionStep $selectionStep,
        Argument $args,
        $viewer,
        RequestStack $request
    ): ConnectionInterface {
        $filters = [];
        list(
            $field,
            $direction,
            $term,
            $filters['district'],
            $filters['theme'],
            $filters['types'],
            $filters['category'],
            $filters['status'],
            $filters['trashedStatus'],
            $filters['progressStatus'],
            $filters['selectionStep'],
            $filters['excludeViewerVotes'],
            $filters['location'],
            ) = [
            $args->offsetGet('orderBy')['field'],
            $args->offsetGet('orderBy')['direction'],
            $args->offsetGet('term'),
            $args->offsetGet('district'),
            $args->offsetGet('theme'),
            $args->offsetGet('userType'),
            $args->offsetGet('category'),
            $args->offsetGet('status'),
            $args->offsetGet('trashedStatus'),
            $args->offsetGet('progressStatus'),
            $selectionStep->getId(),
            $args->offsetGet('excludeViewerVotes'),
            $args->offsetGet('location'),
        ];

        $emptyConnection = ConnectionBuilder::empty(['fusionCount' => 0]);

        // Viewer is asking for unpublished proposals
        if (true === $args->offsetGet('includeUnpublishedOnly')) {
            return $emptyConnection;
        }

        if (null !== $args->offsetGet('analysts')) {
            $analysts = [];
            foreach ($args->offsetGet('analysts') as $analyst) {
                $analysts[] = GlobalIdResolver::getDecodedId($analyst)['id'];
            }
            $filters['analysts'] = $analysts;
        }
        if (null !== $args->offsetGet('supervisor')) {
            $filters['supervisor'] = GlobalIdResolver::getDecodedId($args->offsetGet('supervisor'))['id'];
        }
        if (null !== $args->offsetGet('decisionMaker')) {
            $filters['decisionMaker'] = GlobalIdResolver::getDecodedId(
                $args->offsetGet('decisionMaker')
            )['id'];
        }

        try {
            $order = ProposalSearch::findOrderFromFieldAndDirection($field, $direction);
            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $filters,
                $term,
                $viewer,
                $request,
                $order
            ) {
                $seed = Search::generateSeed($request, $viewer);

                return $this->proposalSearch->searchProposals(
                    $limit,
                    $term,
                    $filters,
                    $seed,
                    $cursor,
                    $order
                );
            });

            $connection = $paginator->auto($args);
            $connection->{'fusionCount'} = 0;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->critical(__METHOD__.' : '.$exception->getMessage());

            return $emptyConnection;
        }
    }
}
