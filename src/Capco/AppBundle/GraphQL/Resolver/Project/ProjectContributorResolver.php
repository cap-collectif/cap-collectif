<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

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

    public function __invoke(Project $project, ?Arg $args = null): Connection
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount, $project) {
            try {
                $value = $this->userSearch->getContributorByProject($project, $offset, $limit);
                $contributors = $value['results'];
                $totalCount = $value['totalCount'];

                return $contributors;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                $totalCount = 0;

                return [];
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->{'anonymousCount'} = $this->getAnonymousCount($project);
        $connection->totalCount = $totalCount;

        return $connection;
    }

    private function getAnonymousCount(Project $project): int
    {
        if (!$project->hasVotableStep()) {
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
