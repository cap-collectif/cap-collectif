<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateVotesVisibilityMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ParticipantHelper $participantHelper
    ) {
    }

    /**
     * @return array<string, array<int, object>>
     */
    public function __invoke(Argument $input, ?User $viewer = null): array
    {
        $this->formatInput($input);

        $stepId = $input->offsetGet('stepId');
        $anonymous = $input->offsetGet('anonymous');
        $participantToken = $input->offsetGet('participantToken');

        $step = $this->getStep($stepId);

        if ($step->isClosed()) {
            throw new UserError('Can not update votes because given step is closed');
        }

        if (!$viewer && !$participantToken) {
            throw new UserError('Must be logged in or given a participant token');
        }

        $participant = null;
        if (!$viewer && $participantToken) {
            try {
                $participant = $this->participantHelper->getParticipantByToken($participantToken);
            } catch (\Exception $e) {
                throw new UserError($e->getMessage());
            }
        }

        $params = $viewer ? ['user' => $viewer] : ['participant' => $participant];

        /** * @var ProposalSelectionVote[] $votes  */
        $votes = $this->proposalSelectionVoteRepository->findBy([...$params, 'selectionStep' => $step]);

        if (empty($votes)) {
            return ['votes' => $votes];
        }

        foreach ($votes as $vote) {
            $vote->setPrivate($anonymous);
        }

        $this->em->flush();

        return ['votes' => $votes];
    }

    private function getStep(string $stepId): SelectionStep
    {
        $step = $this->globalIdResolver->resolve($stepId);

        if (!$step instanceof SelectionStep) {
            throw new UserError('Given step must be of type SelectionStep');
        }

        return $step;
    }
}
