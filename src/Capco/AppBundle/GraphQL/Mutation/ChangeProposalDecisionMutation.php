<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\OfficialResponseAuthor;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ChangeProposalDecisionMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;
    private readonly ProposalDecisionRepository $proposalDecisionRepository;

    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly UserRepository $userRepository, private readonly EntityManagerInterface $entityManager, private readonly StatusRepository $statusRepository, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly LoggerInterface $logger, private readonly Indexer $indexer, private readonly TranslatorInterface $translator, private readonly EventDispatcherInterface $eventDispatcher, private readonly Publisher $publisher, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    public function __invoke(Argument $args, $viewer, RequestStack $request): array
    {
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);
        $proposal = $this->getProposal($args);

        $errorCode = $this->getErrorCode($proposal, $args);
        if ($errorCode) {
            return [
                'decision' => null,
                'errorCode' => $errorCode,
            ];
        }

        if (!($proposalDecision = $proposal->getDecision())) {
            $proposalDecision = $this->createProposalDecision(
                $proposal,
                $request->getCurrentRequest()->getLocale()
            );
        }
        $oldState = $proposalDecision->getState();

        $this->updateDecision($proposalDecision, $args, $viewer);
        $this->handleDecisionOfficialResponse($proposalDecision, $args, $viewer);
        $this->setRefusedReasonIfAny($proposalDecision, $args);

        if ($args->offsetGet('isDone')) {
            self::setAnalysisAndStatementAsTooLate($proposal);
        }

        $analysisConfig = $proposal->getProposalForm()->getAnalysisConfiguration();
        if ($analysisConfig && $analysisConfig->isImmediatelyEffective()) {
            if ($args->offsetGet('isDone')) {
                $this->dispatchEvent($proposal, $args);
            }
            $this->entityManager->flush();
            $this->index($proposal);
            $this->notifyIfDecision($oldState, $proposalDecision);

            return [
                'decision' => $proposalDecision,
                'proposal' => $proposal,
                'errorCode' => null,
            ];
        }

        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing Post and ProposalDecision with proposal id :' .
                    $proposal->getId() .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }
        $this->index($proposal);

        $this->notifyIfDecision($oldState, $proposalDecision);

        return [
            'decision' => $proposalDecision,
            'proposal' => $proposal,
            'errorCode' => null,
        ];
    }

    private function createProposalDecision(Proposal $proposal, string $locale): ProposalDecision
    {
        $proposalDecision = new ProposalDecision($proposal);
        $proposalDecision->setProposal($proposal);
        $this->entityManager->persist($proposalDecision);

        return $proposalDecision;
    }

    private function getErrorCode(?Proposal $proposal, Argument $args): ?string
    {
        if (!$proposal) {
            return ProposalStatementErrorCode::NON_EXISTING_PROPOSAL;
        }
        if (
            !$this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::DECIDE, $proposal)
        ) {
            return ProposalStatementErrorCode::NOT_ASSIGNED_PROPOSAL;
        }
        if (!$args->offsetGet('isApproved') && null === $args->offsetGet('refusedReason')) {
            return ProposalStatementErrorCode::REFUSED_REASON_EMPTY;
        }

        return null;
    }

    private function getProposal(Argument $args): ?Proposal
    {
        return $this->proposalRepository->find(
            GlobalId::fromGlobalId($args->offsetGet('proposalId'))['id']
        );
    }

    private function updateDecision(
        ProposalDecision $proposalDecision,
        Argument $args,
        User $viewer
    ): void {
        $proposalDecision
            ->setIsApproved($args->offsetGet('isApproved') ?? false)
            ->setUpdatedBy($viewer)
            ->setEstimatedCost((int) $args->offsetGet('estimatedCost'))
            ->setState(
                $args->offsetGet('isDone') ?? false
                    ? ProposalStatementState::DONE
                    : ProposalStatementState::IN_PROGRESS
            )
        ;
    }

    private function handleDecisionOfficialResponse(
        ProposalDecision $proposalDecision,
        Argument $args,
        User $viewer
    ): ?OfficialResponse {
        $officialResponse = null;
        if (strip_tags((string) $args->offsetGet('body')) || !empty($args->offsetGet('authors'))) {
            $officialResponse = $proposalDecision->getOfficialResponse();
            if (null === $officialResponse) {
                $officialResponse = new OfficialResponse();
                $officialResponse
                    ->setProposal($proposalDecision->getProposal())
                    ->setIsPublished(false)
                ;
            }
            $officialResponse->setBody($args->offsetGet('body'));
            $this->updateDecisionOfficialResponseAuthors($officialResponse, $args, $viewer);
        } elseif ($proposalDecision->getOfficialResponse()) {
            $this->entityManager->remove($proposalDecision->getOfficialResponse());
        }

        $proposalDecision->setOfficialResponse($officialResponse);

        return $officialResponse;
    }

    private function updateDecisionOfficialResponseAuthors(
        OfficialResponse $officialResponse,
        Argument $args,
        User $viewer
    ): OfficialResponse {
        $authors = $args->offsetGet('authors') ?? [];
        if (!empty($authors)) {
            foreach ($authors as $authorId) {
                $author = $this->globalIdResolver->resolve($authorId, $viewer);
                $officialResponseAuthor = (new OfficialResponseAuthor())
                    ->setAuthor($author)
                    ->setOfficialResponse($officialResponse)
                ;
                $officialResponse->addAuthor($officialResponseAuthor);
            }
        }

        return $officialResponse;
    }

    private function setRefusedReasonIfAny(
        ProposalDecision $proposalDecision,
        Argument $args
    ): ProposalDecision {
        if ($args->offsetGet('refusedReason')) {
            $status = $this->statusRepository->find($args->offsetGet('refusedReason'));
            $proposalDecision->setRefusedReason($status);
        }

        return $proposalDecision;
    }

    private static function setAnalysisAndStatementAsTooLate(Proposal $proposal): Proposal
    {
        $proposalAssessment = $proposal->getAssessment();
        if (
            $proposalAssessment
            && ProposalStatementState::IN_PROGRESS === $proposalAssessment->getState()
        ) {
            $proposalAssessment->setState(ProposalStatementState::TOO_LATE);
        }
        if (!empty($proposal->getAnalyses())) {
            foreach ($proposal->getAnalyses() as $analysis) {
                if (ProposalStatementState::IN_PROGRESS === $analysis->getState()) {
                    $analysis->setState(ProposalStatementState::TOO_LATE);
                }
            }
        }

        return $proposal;
    }

    private function index(Proposal $proposal): void
    {
        $this->indexer->index(Proposal::class, $proposal->getId());

        $this->indexer->finishBulk();
    }

    private function dispatchEvent(Proposal $proposal, Argument $args): DecisionEvent
    {
        $decision = $args->offsetGet('isApproved')
            ? CapcoAppBundleEvents::DECISION_APPROVED
            : CapcoAppBundleEvents::DECISION_REFUSED;
        $event = new DecisionEvent(
            $proposal,
            $proposal->getDecision(),
            $proposal->getProposalForm()->getAnalysisConfiguration()
        );
        $this->eventDispatcher->dispatch($event, $decision);

        return $event;
    }

    private function notifyIfDecision(string $oldState, ProposalDecision $proposalDecision): void
    {
        $message = [
            'type' => 'decision',
            'proposalId' => $proposalDecision->getProposal()->getId(),
            'date' => $proposalDecision->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];
        if (
            ProposalStatementState::DONE === $proposalDecision->getState()
            && $proposalDecision->getState() != $oldState
        ) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE,
                new Message(json_encode($message))
            );
        }
    }
}
