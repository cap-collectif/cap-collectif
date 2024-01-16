<?php

namespace Capco\AppBundle\GraphQL\Mutation\Proposal;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateProposalStepPaperVoteCounterMutation implements MutationInterface
{
    use MutationTrait;

    public const PROPOSAL_NOT_FOUND = 'PROPOSAL_NOT_FOUND';
    public const STEP_NOT_FOUND = 'STEP_NOT_FOUND';
    public const STEP_NOT_VOTABLE = 'STEP_NOT_VOTABLE';

    private EntityManagerInterface $em;
    private GlobalIdResolver $resolver;
    private ProposalStepPaperVoteCounterRepository $repository;
    private Indexer $indexer;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $resolver,
        ProposalStepPaperVoteCounterRepository $repository,
        Indexer $indexer,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->indexer = $indexer;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $proposal = $this->getProposal($input, $viewer);
            $step = $this->getStep($input, $viewer);
            $paperVote = $this->getOrCreatePaperVote($proposal, $step);
            $paperVote->setTotalCount($input->offsetGet('totalCount'));
            $paperVote->setTotalPointsCount($input->offsetGet('totalPointsCount'));
            $this->em->flush();
            $this->indexer->index(\get_class($proposal), $proposal->getId());
            $this->indexer->finishBulk();
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['proposal' => $proposal];
    }

    public function isGranted(string $proposalId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $proposal = $this->resolver->resolve($proposalId, $viewer);

        if ($proposal) {
            return $this->authorizationChecker->isGranted(ProposalVoter::EDIT, $proposal);
        }

        return false;
    }

    private function getOrCreatePaperVote(
        Proposal $proposal,
        AbstractStep $step
    ): ProposalStepPaperVoteCounter {
        $criteria = ['proposal' => $proposal];
        if ($step) {
            $criteria['step'] = $step;
        }

        $paperVote = $this->repository->findOneBy($criteria);
        if (null === $paperVote) {
            $paperVote = self::createPaperVote($proposal, $step);
            $this->em->persist($paperVote);
        }

        return $paperVote;
    }

    private function getStep(Argument $input, User $viewer): AbstractStep
    {
        $step = $this->resolver->resolve($input->offsetGet('step'), $viewer);
        if (!($step instanceof CollectStep) && !($step instanceof SelectionStep)) {
            throw new UserError(self::STEP_NOT_FOUND);
        }

        if (!$step->isVotable()) {
            throw new UserError(self::STEP_NOT_VOTABLE);
        }

        return $step;
    }

    private function getProposal(Argument $input, User $viewer): Proposal
    {
        $proposal = $this->resolver->resolve($input->offsetGet('proposal'), $viewer);

        if (null === $proposal) {
            throw new UserError(self::PROPOSAL_NOT_FOUND);
        }

        return $proposal;
    }

    private static function createPaperVote(
        Proposal $proposal,
        AbstractStep $step
    ): ProposalStepPaperVoteCounter {
        return (new ProposalStepPaperVoteCounter())
            ->setProposal($proposal)
            ->setStep($step)
            ->setTotalCount(0)
            ->setTotalPointsCount(0)
        ;
    }
}
