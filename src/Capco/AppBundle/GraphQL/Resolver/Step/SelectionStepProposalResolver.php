<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\SelectionStep;
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
    private $logger;
    private $proposalSearch;

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
            $filters['themes'],
            $filters['userType'],
            $filters['category'],
            $filters['status'],
            $filters['trashedStatus'],
            $filters['selectionStep']
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
            $selectionStep->getId()
        ];

        // Viewer is asking for unpublished proposals
        if (
            $args->offsetExists('includeUnpublishedOnly') &&
            true === $args->offsetGet('includeUnpublishedOnly')
        ) {
            return ConnectionBuilder::empty(['fusionCount' => 0]);
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
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
