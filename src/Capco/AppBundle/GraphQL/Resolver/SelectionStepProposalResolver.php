<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalFormResolver;
use Capco\AppBundle\Search\ProposalSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class SelectionStepProposalResolver
{
    private $logger;
    private $proposalSearch;

    public function __construct(ProposalSearch $proposalSearch, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->proposalSearch = $proposalSearch;
    }

    public function __invoke(SelectionStep $selectionStep, Argument $args, $user, $request): Connection
    {
        $totalCount = 0;
        $term = null;
        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($selectionStep, $args, $term, $user, $request, &$totalCount) {
                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];
                $filters = [];
                if ($args->offsetExists('district')) {
                    $filters['districts'] = $args->offsetGet('district');
                }
                if ($args->offsetExists('theme')) {
                    $filters['themes'] = $args->offsetGet('theme');
                }
                if ($args->offsetExists('userType')) {
                    $filters['types'] = $args->offsetGet('userType');
                }
                if ($args->offsetExists('category')) {
                    $filters['categories'] = $args->offsetGet('category');
                }
                if ($args->offsetExists('status')) {
                    $filters['statuses'] = $args->offsetGet('status');
                }

                $order = ProposalFormResolver::findOrderFromFieldAndDirection($field, $direction);
                $filters['selectionStep'] = $selectionStep->getId();

                $seed = method_exists($user, 'getId') ? $user->getId() : $request->getClientIp();

                $results = $this->proposalSearch->searchProposals(
                    $offset,
                    $limit,
                    $order,
                    $term,
                    $filters,
                    $seed
                );

                $totalCount = $results['count'];

                return $results['proposals'];
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->totalCount = $totalCount;
            $connection->{'fusionCount'} = 0;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
