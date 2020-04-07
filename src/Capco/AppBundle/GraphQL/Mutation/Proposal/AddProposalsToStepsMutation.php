<?php


namespace Capco\AppBundle\GraphQL\Mutation\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddProposalsToStepsMutation extends AbstractProposalStepMutation implements MutationInterface
{
    public function __invoke(Argument $args, User $user): array
    {
        $error = null;
        $proposals = [];
        $this->project = null;

        try {
            $proposals = $this->getProposals($args->offsetGet('proposalIds'), $user);
            $steps = $this->getSteps($args->offsetGet('stepIds'), $user);
            $this->addStepsToProposals($steps, $proposals);
        } catch (UserError $userError) {
            $error = $userError->getMessage();
        }

        return [
            'proposals' => $this->getConnection($proposals, $args),
            'error' => $error
        ];
    }

    private function addStepsToProposals(array $steps, array $proposals): void
    {
        $changedProposals = [];
        foreach ($proposals as $proposal) {
            $hasChanged = false;
            foreach ($steps as $step) {
                if ($this->addOneStepToOneProposal($step, $proposal)) {
                    $hasChanged = true;
                }
            }

            if ($hasChanged) {
                $changedProposals[] = $proposal;
            }
        }
        $this->entityManager->flush();
        $this->publish($changedProposals);
    }

    private function addOneStepToOneProposal(SelectionStep $step, Proposal $proposal): bool
    {
        if ($this->getSelection($proposal, $step)) {
            return false;
        }

        $selection = new Selection();
        $selection->setSelectionStep($step);
        $selection->setStatus(null);
        $proposal->addSelection($selection);

        $this->entityManager->persist($selection);

        return true;
    }
}
