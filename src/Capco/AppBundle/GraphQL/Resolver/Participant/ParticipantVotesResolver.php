<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalSelectionVoteRepository $voteRepository,
        private readonly GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(Participant $participant, User $viewer, ?Argument $args = null): ConnectionInterface
    {
        $mediatorId = $args->offsetGet('mediatorId') ?? null;
        $mediator = $mediatorId ? $this->getMediator($mediatorId, $viewer) : null;

        ['project' => $project, 'step' => $step] = $this->getContribuable($args, $viewer);

        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->voteRepository->findPaginatedByParticipant(
                $participant,
                $mediator,
                $project,
                $step,
                $limit,
                $offset
            )
        );

        $totalCount = $this->voteRepository->countByParticipant(
            $participant,
            $mediator,
            $project,
            $step
        );

        return $paginator->auto($args, $totalCount);
    }

    public function getContribuable(?Argument $args, User $viewer): array
    {
        $contribuableId = $args->offsetGet('contribuableId');

        if (!$contribuableId) {
            return ['project' => null, 'step' => null];
        }

        $contribuable = $this->globalIdResolver->resolve($contribuableId, $viewer);

        if ($contribuable instanceof Project) {
            return ['project' => $contribuable, 'step' => null];
        }

        if ($contribuable instanceof AbstractStep) {
            return ['project' => null, 'step' => $contribuable];
        }

        return ['project' => null, 'step' => null];
    }

    private function getMediator(string $mediatorId, User $viewer): Mediator
    {
        $mediator = $this->globalIdResolver->resolve($mediatorId, $viewer);

        if (!$mediator instanceof Mediator) {
            throw new \RuntimeException("Mediator not found for id : {$mediatorId}");
        }

        return $mediator;
    }
}
