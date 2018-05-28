<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class UpdateProposalVotesMutation
{
    private $em;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $stepRepo;
    private $logger;

    public function __construct(
      EntityManagerInterface $em,
      $proposalCollectVoteRepository,
      $proposalSelectionVoteRepository,
      AbstractStepRepository $stepRepo,
      LoggerInterface $logger)
    {
        $this->em = $em;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->stepRepo = $stepRepo;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $stepId = $input->offsetGet('step');
        $step = $this->stepRepo->find($stepId);

        if (!$step) {
            throw new UserError(sprintf('Unknown step with id "%s"', $stepId));
        }
        $votesInput = $input->offsetGet('votes');

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->getByAuthorAndStep($user, $step, -1, 0)->getIterator();
        } elseif ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository->getByAuthorAndStep($user, $step, -1, 0)->getIterator();
        } else {
            throw new UserError(sprintf('Not good step with id "%s"', $stepId));
        }

        foreach ($votes as $vote) {
            $voteInput = null;
            foreach ($votesInput as $currentInput) {
                if ((int) $vote->getId() === (int) $currentInput['id']) {
                    $voteInput = $currentInput;
                }
            }
            if ($voteInput) {
                $vote->setPrivate($voteInput['anonymous']);
                if ($step->canContribute() && $step->isVotesRanking()) {
                    $vote->setPosition(array_search($voteInput, $votesInput, true));
                }
            } else {
                if (!$step->canContribute()) {
                    throw new UserError('This step is not contribuable.');
                }
                $this->em->remove($vote);
            }
        }

        $this->em->flush();

        return ['step' => $step, 'viewer' => $user];
    }
}
