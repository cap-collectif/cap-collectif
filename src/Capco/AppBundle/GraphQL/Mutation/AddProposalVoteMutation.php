<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const PHONE_ALREADY_USED = 'PHONE_ALREADY_USED';
    public const CONTRIBUTION_NOT_ALLOWED = 'CONTRIBUTION_NOT_ALLOWED';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly LoggerInterface $logger,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly StepRequirementsResolver $resolver,
        private readonly ProposalVotesDataLoader $proposalVotesDataLoader,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        private readonly ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly ContributionValidator $contributionValidator,
        private readonly Indexer $indexer,
        private readonly UserRepository $userRepository,
    ) {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        $step = $this->globalIdResolver->resolve($stepId, $user);

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        $countUserVotes = 0;
        if ($step instanceof CollectStep) {
            // Check if proposal is in step
            if ($step !== $proposal->getProposalForm()->getStep()) {
                throw new UserError('This proposal is not associated to this collect step.');
            }

            $countUserVotes = $this->proposalCollectVoteRepository->countVotesByStepAndUser(
                $step,
                $user
            );
            $vote = (new ProposalCollectVote())->setCollectStep($step);
        } elseif ($step instanceof SelectionStep) {
            if (!\in_array($step, $proposal->getSelectionSteps(), true)) {
                throw new UserError('This proposal is not associated to this selection step.');
            }
            $countUserVotes = $this->proposalSelectionVoteRepository->countVotesByStepAndUser(
                $step,
                $user
            );
            $vote = (new ProposalSelectionVote())->setSelectionStep($step);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
        }

        // Check if step is contributable
        if (!$this->canContributeAgain($step, $user)) {
            return ['errorCode' => self::CONTRIBUTION_NOT_ALLOWED, 'shouldTriggerConsentInternalCommunication' => false];
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        // Check if user has reached limit of votes
        if ($step->isNumberOfVotesLimitted() && $countUserVotes >= $step->getVotesLimit()) {
            throw new UserError('You have reached the limit of votes.');
        }

        try {
            $this->contributionValidator->validatePhoneReusability($user, $vote, $step);
        } catch (ContributorAlreadyUsedPhoneException) {
            return ['errorCode' => self::PHONE_ALREADY_USED, 'shouldTriggerConsentInternalCommunication' => false];
        }

        $votesMin = $step->getVotesMin();
        if ($votesMin && $countUserVotes + 1 < $votesMin) {
            $vote->setCompletedStatus();
        } else {
            $isViewerMeetingRequirements = $this->resolver->viewerMeetsTheRequirementsResolver($user, $step);
            if (!$isViewerMeetingRequirements) {
                $vote->setIsAccounted(false);
                $vote->setMissingRequirementsStatus();
            } else {
                $vote->setCompletedStatus();
            }
        }

        $vote
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setUser($user)
            ->setPrivate($input->offsetGet('anonymously'))
            ->setProposal($proposal)
        ;

        if ($step->isVotesRanking() && 0 === $countUserVotes) {
            $vote->setPosition(0);
        }

        $this->removePendingVotes($step, $user);

        $errors = $this->validator->validate($vote);
        foreach ($errors as $error) {
            $this->logger->error((string) $error->getMessage());

            throw new UserError((string) $error->getMessage());
        }

        $isCompleted = ContributionCompletionStatus::COMPLETED === $vote->getCompletionStatus();

        if ($isCompleted) {
            $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted($step, $vote, $user, true);
        }
        $hasAlreadyParticipatedInThisProject = $this->userRepository->findWithContributionsByProjectAndParticipant($step->getProject(), $user);

        $this->em->persist($vote);

        $shouldIncrementProjectContributorsTotalCount = !$hasAlreadyParticipatedInThisProject && $vote->getIsAccounted();

        try {
            $this->em->flush();

            $this->proposalVotesDataLoader->invalidate($proposal);
            $this->proposalViewerVoteDataLoader->invalidate($proposal);
            $this->proposalViewerHasVoteDataLoader->invalidate($proposal);
            $this->viewerProposalVotesDataLoader->invalidate($user);
            $this->indexer->index(AbstractVote::class, $vote->getId());
            $this->indexer->index(User::class, $user->getId());
        } catch (UniqueConstraintViolationException) {
            throw new UserError('proposal.vote.already_voted');
        }

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        $shouldTriggerConsentInternalCommunication = $this->getShouldTriggerConsentInternalCommunication($countUserVotes, $user->isConsentInternalCommunication(), $votesMin);

        return [
            'vote' => $vote,
            'viewer' => $user,
            'voteEdge' => $edge,
            'proposal' => $proposal,
            'shouldTriggerConsentInternalCommunication' => $shouldTriggerConsentInternalCommunication,
            'shouldIncrementProjectContributorsTotalCount' => $shouldIncrementProjectContributorsTotalCount,
        ];
    }

    private function getShouldTriggerConsentInternalCommunication(int $totalVotesCount, ?bool $consentInternalCommunication = null, ?int $votesMin = null): bool
    {
        if (!$votesMin) {
            return !$consentInternalCommunication && 0 === $totalVotesCount;
        }

        return !$consentInternalCommunication && $totalVotesCount + 1 === $votesMin;
    }

    private function removePendingVotes(ProposalStepInterface $step, User $viewer): void
    {
        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->getVotesByStepAndContributor($step, $viewer, false);
        } else {
            $votes = $this->proposalCollectVoteRepository->getVotesByStepAndContributor($step, $viewer, false);
        }

        $this->em->getFilters()->enable(ContributionCompletionStatusFilter::FILTER_NAME);

        foreach ($votes as $vote) {
            if (ContributionCompletionStatus::MISSING_REQUIREMENTS === $vote->getCompletionStatus()) {
                $this->em->remove($vote);
            }
        }
    }

    private function canContributeAgain(ProposalStepInterface $step, User $user): bool
    {
        $hasEmailVerifiedRequirement = $step->getRequirements()->filter(fn (Requirement $requirement) => Requirement::EMAIL_VERIFIED === $requirement->getType())->count() > 0;

        if (!$hasEmailVerifiedRequirement) {
            return $step->canContribute($user);
        }

        $existingParticipantAlreadyContributedWithSameEmail = null;
        if ($step instanceof SelectionStep) {
            $existingParticipantAlreadyContributedWithSameEmail = \count($this->proposalSelectionVoteRepository->findByParticipantEmail($user->getEmail(), $step)) > 0;
        } elseif ($step instanceof CollectStep) {
            $existingParticipantAlreadyContributedWithSameEmail = \count($this->proposalCollectVoteRepository->findByParticipantEmail($user->getEmail(), $step)) > 0;
        }

        if ($existingParticipantAlreadyContributedWithSameEmail) {
            return false;
        }

        return true;
    }
}
