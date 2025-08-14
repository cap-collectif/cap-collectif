<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
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
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalSmsVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const PROPOSAL_ALREADY_VOTED = 'PROPOSAL_ALREADY_VOTED';
    public const VOTE_LIMIT_REACHED = 'VOTE_LIMIT_REACHED';
    public const PHONE_ALREADY_USED = 'PHONE_ALREADY_USED';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly LoggerInterface $logger,
        private readonly ProposalVotesDataLoader $proposalVotesDataLoader,
        private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly ParticipantHelper $participantHelper,
        private readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly ContributionValidator $contributionValidator,
        private readonly Indexer $indexer,
        private readonly ParticipantRepository $participantRepository,
        private readonly ProjectParticipantsTotalCountCacheHandler $participantsTotalCountCacheHandler,
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');

        $token = $input->offsetGet('token');

        $participant = $this->participantHelper->getOrCreateParticipant($token);

        $proposal = $this->globalIdResolver->resolve($proposalId);
        $step = $this->globalIdResolver->resolve($stepId);

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        $countParticipantsVotes = 0;
        if ($step instanceof CollectStep) {
            // Check if proposal is in step
            if ($step !== $proposal->getProposalForm()->getStep()) {
                throw new UserError('This proposal is not associated to this collect step.');
            }

            $countParticipantsVotes = $this->proposalCollectVoteRepository->countByTokenAndStep(
                $step,
                $participant->getToken()
            );
            $vote = (new ProposalCollectVote())->setCollectStep($step);
        } elseif ($step instanceof SelectionStep) {
            if (!\in_array($step, $proposal->getSelectionSteps(), true)) {
                throw new UserError('This proposal is not associated to this selection step.');
            }
            $countParticipantsVotes = $this->proposalSelectionVoteRepository->countByTokenAndStep(
                $step,
                $participant->getToken()
            );
            $vote = (new ProposalSelectionVote())->setSelectionStep($step);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
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
        if ($step->isNumberOfVotesLimitted() && $countParticipantsVotes >= $step->getVotesLimit()) {
            // when vote limit is reached we need to fetch user votes to refresh the relay cache
            $paginator = new Paginator(function () use ($step, $token) {
                $repository =
                    $step instanceof CollectStep
                        ? $this->proposalCollectVoteRepository
                        : $this->proposalSelectionVoteRepository;

                return $repository
                    ->getByTokenAndStep($step, $token)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });
            $connection = $paginator->auto(new Argument(), $countParticipantsVotes);

            return ['errorCode' => self::VOTE_LIMIT_REACHED, 'votes' => $connection, 'shouldTriggerConsentInternalCommunication' => false];
        }

        try {
            $this->contributionValidator->validatePhoneReusability($participant, $vote, $step);
        } catch (ContributorAlreadyUsedPhoneException) {
            return ['errorCode' => self::PHONE_ALREADY_USED, 'shouldTriggerConsentInternalCommunication' => false, 'participant' => $participant];
        }

        $vote
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setProposal($proposal)
            ->setParticipant($participant)
            ->setPrivate($input->offsetGet('anonymously'))
        ;

        if ($step->isVotesRanking() && 0 === $countParticipantsVotes) {
            $vote->setPosition(0);
        }

        $this->removePendingVotes($step, $participant);

        $isParticipantMeetingRequirements = true;
        if ($step->getVotesMin() && $countParticipantsVotes + 1 < $step->getVotesMin()) {
            $vote->setCompletedStatus();
        } else {
            $isParticipantMeetingRequirements = $this->participantIsMeetingRequirementsResolver->__invoke($participant, new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId())]));
            if (!$isParticipantMeetingRequirements) {
                $vote->setIsAccounted(false);
                $vote->setMissingRequirementsStatus();
            } else {
                $vote->setCompletedStatus();
            }
        }

        $errors = $this->validator->validate($vote);
        foreach ($errors as $error) {
            $this->logger->error((string) $error->getMessage());

            throw new UserError((string) $error->getMessage());
        }

        if (ContributionCompletionStatus::COMPLETED === $vote->getCompletionStatus()) {
            $this->proposalVoteAccountHandler->checkIfParticipantVotesAreStillAccounted($step, $vote, $participant, true);
        }

        $this->em->persist($vote);

        $hasAlreadyParticipatedInThisProject = $this->participantRepository->findWithContributionsByProjectAndParticipant($step->getProject(), $participant);

        try {
            $this->em->flush();
            $participant->setLastContributedAt(new \DateTime());
            $this->proposalVotesDataLoader->invalidate($proposal);
            $this->proposalViewerVoteDataLoader->invalidate($proposal);
            $this->proposalViewerHasVoteDataLoader->invalidate($proposal);

            $this->participantsTotalCountCacheHandler->incrementTotalCount(
                project: $step->getProject(),
                conditionCallBack: fn ($cachedItem) => $cachedItem->isHit() && $isParticipantMeetingRequirements && !$hasAlreadyParticipatedInThisProject && $vote->getIsAccounted(),
            );

            $this->indexer->index(AbstractVote::class, $vote->getId());
        } catch (UniqueConstraintViolationException) {
            return ['errorCode' => self::PROPOSAL_ALREADY_VOTED, 'shouldTriggerConsentInternalCommunication' => false, 'participant' => $participant];
        }

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        $shouldTriggerConsentInternalCommunication = $this->getShouldTriggerConsentInternalCommunication($countParticipantsVotes, $participant->isConsentInternalCommunication(), $step->getVotesMin());

        return [
            'vote' => $vote,
            'voteEdge' => $edge,
            'proposal' => $proposal,
            'participantToken' => $participant->getToken(),
            'shouldTriggerConsentInternalCommunication' => $shouldTriggerConsentInternalCommunication,
            'participant' => $participant,
        ];
    }

    private function getShouldTriggerConsentInternalCommunication(int $totalVotesCount, ?bool $consentInternalCommunication = null, ?int $votesMin = null): bool
    {
        if (!$votesMin) {
            return !$consentInternalCommunication && 0 === $totalVotesCount;
        }

        return !$consentInternalCommunication && $totalVotesCount + 1 === $votesMin;
    }

    private function removePendingVotes(ProposalStepInterface $step, Participant $participant): void
    {
        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->getVotesByStepAndContributor($step, $participant, false);
        } else {
            $votes = $this->proposalCollectVoteRepository->getVotesByStepAndContributor($step, $participant, false);
        }

        $this->em->getFilters()->enable(ContributionCompletionStatusFilter::FILTER_NAME);

        foreach ($votes as $vote) {
            if (ContributionCompletionStatus::MISSING_REQUIREMENTS === $vote->getCompletionStatus()) {
                $this->em->remove($vote);
            }
        }
    }
}
