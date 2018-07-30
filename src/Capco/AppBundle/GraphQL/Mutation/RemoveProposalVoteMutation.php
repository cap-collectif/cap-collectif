<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

class RemoveProposalVoteMutation
{
    private $em;
    private $proposalRepo;
    private $stepRepo;
    private $proposalVotesDataLoader;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepo,
        AbstractStepRepository $stepRepo,
        ProposalVotesDataLoader $proposalVotesDataLoader
    ) {
        $this->em = $em;
        $this->stepRepo = $stepRepo;
        $this->proposalRepo = $proposalRepo;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
    }

    public function __invoke(Argument $input, User $user)
    {
        $proposal = $this->proposalRepo->find($input->offsetGet('proposalId'));
        $step = $this->stepRepo->find($input->offsetGet('stepId'));

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $input->offsetGet('proposalId'));
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $input->offsetGet('stepId'));
        }

        $vote = null;
        if ($step instanceof CollectStep) {
            $vote = $this->em->getRepository('CapcoAppBundle:ProposalCollectVote')->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'collectStep' => $step,
            ]);
        } elseif ($step instanceof SelectionStep) {
            $vote = $this->em->getRepository('CapcoAppBundle:ProposalSelectionVote')->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'selectionStep' => $step,
            ]);
        } else {
            throw new UserError('Wrong step with id: ' . $input->offsetGet('stepId'));
        }

        if (!$vote) {
            throw new UserError('You have not voted for this proposal in this step.');
        }

        // Check if step is contributable
        if (!$step->canContribute()) {
            throw new UserError('This step is no longer contributable.');
        }

        $this->em->remove($vote);
        $this->em->flush();
        $this->proposalVotesDataLoader->invalidate($proposal);

        return ['proposal' => $proposal, 'step' => $step, 'viewer' => $user];
    }
}
