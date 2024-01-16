<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class ProjectContributorResolver implements QueryInterface
{
    use ResolverTrait;

    private UserSearch $userSearch;
    private LoggerInterface $logger;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private GlobalIdResolver $globalIdResolver;
    private AbstractStepRepository $stepRepository;
    private ConnectionBuilder $connectionBuilder;
    private ParticipantRepository $participantRepository;

    public function __construct(
        UserSearch $userSearch,
        LoggerInterface $logger,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        GlobalIdResolver $globalIdResolver,
        AbstractStepRepository $stepRepository,
        ConnectionBuilder $connectionBuilder,
        ParticipantRepository $participantRepository
    ) {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->stepRepository = $stepRepository;
        $this->connectionBuilder = $connectionBuilder;
        $this->participantRepository = $participantRepository;
    }

    public function __invoke(Project $project, ?Arg $args = null): ConnectionInterface
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
                $args->offsetGet('userType'),
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
                    $response = $this->userSearch->getContributorByProject(
                        $project,
                        $orderBy,
                        $providedFilters,
                        $limit,
                        $cursor
                    );
                    $userContributors = $response->getEntities();

                    list($participantsContributors, $participantsCount, $participantsCursors) = $this->getParticipants($project, $providedFilters['step']);

                    $cursors = array_merge($response->getCursors(), $participantsCursors);
                    $response->setCursors($cursors);

                    $allContributors = array_merge($userContributors, $participantsContributors);

                    $response->setEntities($allContributors);
                    // Set the totalCount here because of the else statement below.
                    $totalCount = $response->getTotalCount() + $participantsCount;
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

    public function getParticipants(Project $project, ?string $stepId = null): array
    {
        $participantsContributors = $this->getParticipantsContributors($project, $stepId) ?? [];
        $participantsCount = \count($participantsContributors);
        $participantsCursors = array_map(function ($participantContributor) {
            return [1, $participantContributor->getId()];
        }, $participantsContributors);

        return [$participantsContributors, $participantsCount, $participantsCursors];
    }

    private function getParticipantsContributors(Project $project, ?string $stepId = null): array
    {
        $step = $stepId ? $this->stepRepository->find($stepId) : null;

        if ($step && !$step instanceof SelectionStep) {
            return [];
        }

        return $this->participantRepository->findWithVotes($project, $step);
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
            }
        }

        return $anonymousCount;
    }
}
