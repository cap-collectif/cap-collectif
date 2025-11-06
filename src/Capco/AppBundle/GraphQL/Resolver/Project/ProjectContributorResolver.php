<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class ProjectContributorResolver implements QueryInterface
{
    use ResolverTrait;

    private bool $isOnlyFetchingTotalCount = false;

    public function __construct(
        private readonly UserSearch $userSearch,
        private readonly LoggerInterface $logger,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly AbstractStepRepository $stepRepository,
        private readonly ConnectionBuilderInterface $connectionBuilder,
        private readonly ParticipantRepository $participantRepository,
        private readonly ProjectParticipantsTotalCountCacheHandler $projectParticipantsTotalCountCacheHandler,
    ) {
    }

    public function __invoke(Project $project, ?ResolveInfo $info = null, ?Arg $args = null): ConnectionInterface
    {
        $requestedFields = $info ? $this->getRequestedFields($info) : [];

        $this->isOnlyFetchingTotalCount = 1 === \count($requestedFields) && 'totalCount' === $requestedFields[0];

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
                    $response = $this->userSearch->getContributorByProject(
                        $project,
                        $orderBy,
                        $providedFilters,
                        $limit,
                        $cursor
                    );
                    $userContributors = $response->getEntities();

                    [$participantsContributors, $participantsCount, $participantsCursors] = $this->getParticipants($project, $providedFilters['step'], $providedFilters['term']);

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

    public function getParticipants(Project $project, ?string $stepId = null, ?string $term = null): array
    {
        $step = $stepId ? $this->globalIdResolver->resolve($stepId) : null;
        if ($this->isOnlyFetchingTotalCount) {
            $participantsCount = $this->projectParticipantsTotalCountCacheHandler->updateTotalCount(
                updateCallable: fn () => $this->participantRepository->countWithContributionsByProject($project, $step, $term),
                project: $project,
                conditionCallBack: fn ($cachedItem): bool => !$cachedItem->isHIt()
            );

            return [[], $participantsCount, []];
        }

        $participantsContributors = $this->getParticipantsContributors($project, $stepId, $term) ?? [];
        $participantsCount = $this->participantRepository->countWithContributionsByProject($project, $step, $term);

        $participantsCursors = array_map(fn ($participantContributor) => [1, $participantContributor->getId()], $participantsContributors);

        return [$participantsContributors, $participantsCount, $participantsCursors];
    }

    private function getRequestedFields(ResolveInfo $info): array
    {
        $fields = [];

        $fieldNodes = $info->fieldNodes;
        foreach ($fieldNodes as $fieldNode) {
            if (!isset($fieldNode->selectionSet)) {
                continue;
            }

            foreach ($fieldNode->selectionSet->selections as $selection) {
                if (property_exists($selection, 'name')) {
                    $fields[] = $selection->name->value;
                }
            }
        }

        return $fields;
    }

    private function getParticipantsContributors(Project $project, ?string $stepId = null, ?string $term = null): array
    {
        $step = $stepId ? $this->stepRepository->find($stepId) : null;

        return $this->participantRepository->getParticipantsWithContributionsByProject($project, $step, $term);
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
