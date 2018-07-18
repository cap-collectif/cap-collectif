<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveOpinionVoteMutation implements MutationInterface
{
    private $em;
    private $proposalRepo;
    private $stepRepo;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepo,
        AbstractStepRepository $stepRepo
    ) {
        $this->em = $em;
        $this->stepRepo = $stepRepo;
        $this->proposalRepo = $proposalRepo;
    }

    public function __invoke(Argument $input, User $user)
    {
        // if (!$opinion->canContribute()) {
        //     throw new BadRequestHttpException('Uncontribuable opinion.');
        // }

        // $vote = $this->getDoctrine()
        //     ->getManager()
        //     ->getRepository('CapcoAppBundle:OpinionVote')
        //     ->findOneBy(['user' => $this->getUser(), 'opinion' => $opinion]);

        // if (!$vote) {
        //     throw new BadRequestHttpException('You have not voted for this opinion.');
        // }

        // $opinion->decrementVotesCountByType($vote->getValue());
        // $this->getDoctrine()
        //     ->getManager()
        //     ->remove($vote);
        // $this->getDoctrine()
        //     ->getManager()
        //     ->flush();
        // $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        // return $vote;
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
            $vote = $this->em
                ->getRepository('CapcoAppBundle:ProposalCollectVote')
                ->findOneBy(['user' => $user, 'proposal' => $proposal, 'collectStep' => $step]);
        } elseif ($step instanceof SelectionStep) {
            $vote = $this->em
                ->getRepository('CapcoAppBundle:ProposalSelectionVote')
                ->findOneBy(['user' => $user, 'proposal' => $proposal, 'selectionStep' => $step]);
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

        return ['proposal' => $proposal, 'step' => $step, 'viewer' => $user];
    }
}
