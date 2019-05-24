<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Resolver\ContributionResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectContributorResolver implements ResolverInterface
{
    public $useElasticsearch = true;
    private $userSearch;
    private $logger;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;
    private $contributionsResolver;

    public function __construct(
        UserSearch $userSearch,
        LoggerInterface $logger,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ContributionResolver $contributionsResolver
    ) {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->contributionsResolver = $contributionsResolver;
    }

    public function __invoke(Project $project, ?Arg $args = null): Connection
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        if (empty($project->getExternalLink())) {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                &$totalCount,
                $project
            ) {
                if ($this->useElasticsearch) {
                    $value = $this->userSearch->getContributorByProject($project, $offset, $limit);
                    $contributors = $value['results'];
                    $totalCount = $value['totalCount'];

                    return $contributors;
                }
                $contributors = $this->contributionsResolver->getProjectContributorsOrdered(
                    $project
                );
                $totalCount = \count($contributors);

                return [];
            });
        } else {
            $paginator = new Paginator(function () use (&$totalCount, $project) {
                $totalCount = $project->getContributionsCount();

                return [];
            });
        }

        $connection = $paginator->auto($args, $totalCount);
        $connection->{'anonymousCount'} = $this->getAnonymousCount($project);
        $connection->totalCount = $totalCount;

        return $connection;
    }

    private function getAnonymousCount(Project $project): int
    {
        if (!$project->hasVotableStep() || !empty($project->getExternalLink())) {
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
