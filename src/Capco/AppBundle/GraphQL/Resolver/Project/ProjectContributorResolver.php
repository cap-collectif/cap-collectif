<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ProjectContributorSearch;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class ProjectContributorResolver implements QueryInterface
{
    public function __construct(
        private readonly ProjectContributorSearch $projectContributorSearch,
        private readonly LoggerInterface $logger,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly DebateAnonymousVoteRepository $debateAnonymousVoteRepository,
    ) {
    }

    public function __invoke(Project $project, ?ResolveInfo $info = null, ?Arg $args = null): ConnectionInterface
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg([
                'first' => 0,
                'orderBy' => [
                    'field' => 'CREATED_AT',
                    'direction' => 'DESC',
                ],
            ]);
        }
        if (!$project->isExternal()) {
            $providedFilters = [];
            [
                $providedFilters['step'],
                $providedFilters['vip'],
                $providedFilters['userType'],
                $providedFilters['term'],
                $providedFilters['emailConfirmed'],
                $providedFilters['consentInternalCommunication'],
                $orderBy,
            ] = [
                GlobalId::fromGlobalId($args->offsetGet('step'))['id'],
                $args->offsetGet('vip'),
                GlobalId::fromGlobalId($args->offsetGet('userType'))['id'],
                $args->offsetGet('term'),
                $args->offsetGet('emailConfirmed'),
                $args->offsetGet('consentInternalCommunication'),
                $args->offsetGet('orderBy') ?: [],
            ];

            $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
                $project,
                $orderBy,
                $providedFilters,
                &$totalCount
            ) {
                try {
                    $response = $this->projectContributorSearch->findContributors(
                        $project,
                        $providedFilters,
                        $orderBy,
                        $limit,
                        $cursor
                    );
                    $totalCount = $response->getTotalCount()
                        + $this->debateAnonymousVoteRepository->countAnonymousContributorsByProject($project);
                    $response->setTotalCount($totalCount);

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
        if ($project->isExternal()) {
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
            }
        }

        // Add debate anonymous votes
        $anonymousCount += $this->debateAnonymousVoteRepository->countAnonymousContributorsByProject($project);

        return $anonymousCount;
    }
}
