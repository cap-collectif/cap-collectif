<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class StepContributorResolver implements QueryInterface
{
    public function __construct(
        private readonly UserSearch $userSearch,
        private readonly LoggerInterface $logger,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ParticipantRepository $participantRepository
    ) {
    }

    public function __invoke(AbstractStep $step, Arg $args): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use ($step) {
            try {
                $response = $this->userSearch->getContributorByStep($step, $limit, $cursor);
                $userContributors = $response->getEntities();

                $project = $step->getProject();
                ['participants' => $participants, 'participantsCount' => $participantsCount, 'participantsCursors' => $participantsCursors] = $this->getParticipants($step, $project);

                $cursors = array_merge($response->getCursors(), $participantsCursors);
                $response->setCursors($cursors);

                $allContributors = array_merge($userContributors, $participants);

                $response->setEntities($allContributors);
                $totalCount = $response->getTotalCount() + $participantsCount;
                $response->setTotalCount($totalCount);

                return $response;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        $connection = $paginator->auto($args);
        $connection->{'anonymousCount'} = $this->getAnonymousVote($step);

        return $connection;
    }

    public function getParticipants(AbstractStep $step, ?Project $project): array
    {
        if (!$step instanceof SelectionStep || null === $project) {
            return ['participants' => [], 'participantsCount' => 0, 'participantsCursors' => []];
        }

        $participants = $this->participantRepository->findWithVotes($project, $step);
        $participantsCount = $this->participantRepository->countWithContributionsByProject($project, $step);

        $participantsCursors = array_map(fn ($participant) => [1, $participant->getId()], $participants);

        return ['participants' => $participants, 'participantsCount' => $participantsCount, 'participantsCursors' => $participantsCursors];
    }

    private function getAnonymousVote(AbstractStep $step): int
    {
        if (!$step instanceof CollectStep && !$step instanceof SelectionStep) {
            return 0;
        }

        return $step instanceof CollectStep
            ? $this->proposalCollectVoteRepository->getAnonymousVotesCountByStep($step)
            : $this->proposalSelectionVoteRepository->getAnonymousVotesCountByStep($step);
    }
}
