<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateVotesVisibilityMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private readonly GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        $this->em = $em;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @return array<string, array<int, object>>
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        $stepId = $input->offsetGet('stepId');
        $anonymous = $input->offsetGet('anonymous');

        $step = $this->getStep($stepId, $viewer);

        if ($step->isClosed()) {
            throw new UserError('Can not update votes because given step is closed');
        }

        /** * @var ProposalSelectionVote[] $votes  */
        $votes = $this->proposalSelectionVoteRepository->findBy(['user' => $viewer, 'selectionStep' => $step]);

        if (empty($votes)) {
            return ['votes' => $votes];
        }

        foreach ($votes as $vote) {
            $vote->setPrivate($anonymous);
        }

        $this->em->flush();

        return ['votes' => $votes];
    }

    private function getStep(string $stepId, User $viewer): SelectionStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (!$step instanceof SelectionStep) {
            throw new UserError('Given step must be of type SelectionStep');
        }

        return $step;
    }
}
