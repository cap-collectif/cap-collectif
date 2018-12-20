<?php
namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\ProposalForm\ProposalFormProposalsResolver;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
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
    ): Connection {
        // Viewer is asking for unpublished proposals
        if (
            $args->offsetExists('includeUnpublishedOnly') &&
            $args->offsetGet('includeUnpublishedOnly') === true
        ) {
            $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
            $emptyConnection->totalCount = 0;
            $emptyConnection->{'fusionCount'} = 0;
            return $emptyConnection;
        }
        $totalCount = 0;
        $term = null;
        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $selectionStep,
                $args,
                $term,
                $viewer,
                $request,
                &$totalCount
            ) {
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
                if ($args->offsetExists('trashedStatus')) {
                    $filters['trashedStatus'] = $args->offsetGet('trashedStatus');
                }

                $order = ProposalFormProposalsResolver::findOrderFromFieldAndDirection(
                    $field,
                    $direction
                );
                $filters['selectionStep'] = $selectionStep->getId();

                if ($viewer instanceof User) {
                    // sprintf with %u is here in order to avoid negative int.
                    $seed = sprintf('%u', crc32($viewer->getId()));
                } elseif ($request->getCurrentRequest()) {
                    // sprintf with %u is here in order to avoid negative int.
                    $seed = sprintf('%u', ip2long($request->getCurrentRequest()->getClientIp()));
                } else {
                    $seed = random_int(0, PHP_INT_MAX);
                }

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
