<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalVoteMutation
{
    private $em;
    private $validator;
    private $proposalRepo;
    private $stepRepo;
    private $logger;

    public function __construct(EntityManagerInterface $em, ValidatorInterface $validator, ProposalRepository $proposalRepo, AbstractStepRepository $stepRepo, $logger)
    {
        $this->em = $em;
        $this->validator = $validator;
        $this->stepRepo = $stepRepo;
        $this->proposalRepo = $proposalRepo;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user, $request)
    {
        $proposal = $this->proposalRepo->find($input->offsetGet('proposalId'));
        $step = $this->stepRepo->find($input->offsetGet('stepId'));

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $input->offsetGet('proposalId'));
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $input->offsetGet('stepId'));
        }

        if ($step instanceof CollectStep) {
            // Check if proposal is in step
            if ($step !== $proposal->getProposalForm()->getStep()) {
                throw new UserError('This proposal is not associated to this collect step.');
            }
            $countUserVotes = $this->em
              ->getRepository('CapcoAppBundle:ProposalCollectVote')
              ->countVotesByStepAndUser($step, $user)
          ;
            $vote = (new ProposalCollectVote())
              ->setCollectStep($step);
        } elseif ($step instanceof SelectionStep) {
            if (!in_array($step, $proposal->getSelectionSteps(), true)) {
                throw new UserError('This proposal is not associated to this selection step.');
            }
            $countUserVotes = $this->em
              ->getRepository('CapcoAppBundle:ProposalSelectionVote')
              ->countVotesByStepAndUser($step, $user)
          ;
            $vote = (new ProposalSelectionVote())
              ->setSelectionStep($step)
              ;
        } else {
            throw new UserError('Wrong step with id: ' . $input->offsetGet('stepId'));
        }

        // Check if step is contributable
        if (!$step->canContribute()) {
            throw new UserError('This step is no longer contributable.');
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        // Check if user has reached limit of votes
        if ($step->isNumberOfVotesLimitted()) {
            if ($countUserVotes >= $step->getVotesLimit()) {
                throw new UserError('You have reached the limit of votes.');
            }
        }

        $vote
            ->setIpAddress($request->getClientIp())
            ->setUser($user)
            ->setProposal($proposal)
        ;

        $errors = $this->validator->validate($vote);
        foreach ($errors as $error) {
            $this->logger->error((string) $error->getMessage());
            throw new UserError((string) $error->getMessage());
        }

        $this->em->persist($vote);

        try {
            $this->em->flush();
        } catch (\Exception $e) {
            throw new UserError('Sorry, please retry later.');
        }

        return ['proposal' => $proposal, 'viewer' => $user];
    }
}
