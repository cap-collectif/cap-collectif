<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectContributorResolver implements ResolverInterface
{
    private $userSearch;
    private $logger;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;

    public function __construct(
        UserSearch $userSearch,
        LoggerInterface $logger,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
    }

    public function __invoke(Project $project, ?Arg $args = null): ConnectionInterface
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }

        if (!$project->isExternal()) {
            $providedFilters = [];
            list(
                $providedFilters['step'],
                $providedFilters['vip'],
                $providedFilters['userType'],
                $orderBy,
            ) = [
                GlobalId::fromGlobalId($args->offsetGet('step'))['id'],
                $args->offsetGet('vip'),
                $args->offsetGet('userType'),
                $args->offsetGet('orderBy') ?: [],
            ];

            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $project,
                $orderBy,
                $providedFilters,
                &$totalCount
            ) {
                try {
                    $response = $this->userSearch->getContributorByProject(
                        $project,
                        $orderBy,
                        $providedFilters,
                        $limit,
                        $cursor
                    );
                    // Set the totalCount here because of the else statement below.
                    $totalCount = $response->getTotalCount();

                    return $response;
                } catch (\RuntimeException $exception) {
                    $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                    throw new \RuntimeException('Find contributors failed.');
                }
            });
        } else {
            $paginator = new Paginator(static function () use (&$totalCount, $project) {
                $totalCount = $project->getExternalParticipantsCount() ?? 0;

                return [];
            });
        }

        $connection = $paginator->auto($args, $totalCount);
        $connection->{'anonymousCount'} = $this->getAnonymousCount($project);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function getAnonymousCount(Project $project): int
    {
        if (!$project->hasVotableStep() || $project->isExternal()) {
            return 0;
        }

        $anonymousCount = 0;

        foreach ($project->getRealSteps() as $step) {
            if ($step instanceof CollectStep) {
                $anonymousCount += $this->proposalCollectVoteRepository->getAnonymousVotesCountByStep(
                    $step
                );

                continue;
            }

            if ($step instanceof SelectionStep) {
                $anonymousCount += $this->proposalSelectionVoteRepository->getAnonymousVotesCountByStep(
                    $step
                );

                continue;
            }
        }

        return $anonymousCount;
    }
}
