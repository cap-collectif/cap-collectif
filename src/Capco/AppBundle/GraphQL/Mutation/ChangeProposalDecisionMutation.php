<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\OfficialResponseAuthor;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\DecisionFlowContext;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\DecisionFlowStrategyInterface;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\DecisionTransitionContext;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\ImmediatelyEffectiveDecisionFlowStrategy;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\StandardDecisionFlowStrategy;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ChangeProposalDecisionMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly StatusRepository $statusRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly TranslatorInterface $translator,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ImmediatelyEffectiveDecisionFlowStrategy $immediatelyEffectiveDecisionFlowStrategy,
        private readonly StandardDecisionFlowStrategy $standardDecisionFlowStrategy
    ) {}

    public function __invoke(Argument $args, $viewer): array
    {
        // Step 1: validate input and access.
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);
        $proposal = $this->getProposal($args);

        $errorCode = $this->getErrorCode($proposal, $args);
        if ($errorCode) {
            return $this->buildErrorPayload($errorCode);
        }

        // Step 2: load or create decision and capture pre-update state.
        $proposalDecision = $this->getOrCreateProposalDecision($proposal);
        $oldState = $proposalDecision->getState();
        $transitionContext = $this->computeDecisionTransitionContext($proposalDecision, $args, $oldState);

        // Step 3: apply decision changes.
        $this->updateDecision($proposalDecision, $args, $viewer);
        $this->handleDecisionOfficialResponse($proposalDecision, $args, $viewer);
        $this->setRefusedReasonIfAny($proposalDecision, $args);

        // Step 4: update related analyses when transitioning to done.
        if ($transitionContext->isTransitionToDone) {
            $this->setAnalysisAndStatementAsTooLate($proposal);
        }

        // Step 5: route to immediate or standard flow.
        $errorCode = $this->executeDecisionFlow(
            $proposal,
            $proposalDecision,
            $args,
            $oldState,
            $transitionContext
        );
        if (null !== $errorCode) {
            return $this->buildErrorPayload($errorCode);
        }

        // Step 6: return successful payload.
        return [
            'decision' => $proposalDecision,
            'proposal' => $proposal,
            'errorCode' => null,
        ];
    }

    private function getOrCreateProposalDecision(Proposal $proposal): ProposalDecision
    {
        $proposalDecision = $proposal->getDecision();
        if ($proposalDecision) {
            return $proposalDecision;
        }

        $proposalDecision = new ProposalDecision($proposal);
        $proposalDecision->setProposal($proposal);
        $this->entityManager->persist($proposalDecision);

        return $proposalDecision;
    }

    private function computeDecisionTransitionContext(
        ProposalDecision $proposalDecision,
        Argument $args,
        string $oldState
    ): DecisionTransitionContext {
        $wasDone = ProposalStatementState::DONE === $oldState;
        $isDoneRequested = (bool) $args->offsetGet('isDone');
        $isTransitionToDone = $isDoneRequested && !$wasDone;
        $hasOfficialResponseContentChanged = $this->hasOfficialResponseContentChanged($proposalDecision, $args);
        $shouldDispatchFinalizationEvent
            = $isTransitionToDone
            || ($wasDone && $isDoneRequested && $this->hasDecisionOutcomeChanged($proposalDecision, $args));

        return new DecisionTransitionContext(
            $wasDone,
            $isDoneRequested,
            $isTransitionToDone,
            $hasOfficialResponseContentChanged,
            $shouldDispatchFinalizationEvent
        );
    }

    private function executeDecisionFlow(
        Proposal $proposal,
        ProposalDecision $proposalDecision,
        Argument $args,
        string $oldState,
        DecisionTransitionContext $transitionContext
    ): ?string {
        $strategy = $this->resolveDecisionFlowStrategy($proposal);

        return $strategy->execute(
            new DecisionFlowContext(
                $proposal,
                $proposalDecision,
                $args,
                $oldState,
                $transitionContext
            )
        );
    }

    private function resolveDecisionFlowStrategy(Proposal $proposal): DecisionFlowStrategyInterface
    {
        $analysisConfig = $proposal->getProposalForm()->getAnalysisConfiguration();
        if (null !== $analysisConfig && $analysisConfig->isImmediatelyEffective()) {
            return $this->immediatelyEffectiveDecisionFlowStrategy;
        }

        return $this->standardDecisionFlowStrategy;
    }

    /**
     * @return array{decision: null, errorCode: ?string}
     */
    private function buildErrorPayload(?string $errorCode): array
    {
        return [
            'decision' => null,
            'errorCode' => $errorCode,
        ];
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

        $isDoneRequested = (bool) ($args->offsetGet('isDone') ?? false);
        if (!$isDoneRequested) {
            return null;
        }

        $isApproved = $args->offsetGet('isApproved');
        if (null === $isApproved) {
            return ProposalStatementErrorCode::DECISION_REQUIRED;
        }

        if (false === $isApproved && null === $args->offsetGet('refusedReason')) {
            return ProposalStatementErrorCode::REFUSED_REASON_REQUIRED;
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
            ->setIsApproved($args->offsetGet('isApproved'))
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

    private function hasDecisionOutcomeChanged(
        ProposalDecision $proposalDecision,
        Argument $args
    ): bool {
        $newIsApproved = $args->offsetGet('isApproved');
        $oldIsApproved = $proposalDecision->isApproved();
        if ($oldIsApproved !== $newIsApproved) {
            return true;
        }

        $newEstimatedCost = (int) $args->offsetGet('estimatedCost');
        $oldEstimatedCost = (int) ($proposalDecision->getEstimatedCost() ?? 0);
        if ($oldEstimatedCost !== $newEstimatedCost) {
            return true;
        }

        if (true === $newIsApproved) {
            return false;
        }

        $newRefusedReasonId = $args->offsetGet('refusedReason');
        $oldRefusedReasonId = $proposalDecision->getRefusedReason()?->getId();

        return $oldRefusedReasonId !== $newRefusedReasonId;
    }

    private function hasOfficialResponseContentChanged(
        ProposalDecision $proposalDecision,
        Argument $args
    ): bool {
        $newBody = (string) ($args->offsetGet('body') ?? '');
        $newAuthors = $args->offsetGet('authors') ?? [];
        sort($newAuthors);

        $officialResponse = $proposalDecision->getOfficialResponse();
        if (null === $officialResponse) {
            return '' !== strip_tags($newBody) || !empty($newAuthors);
        }

        $oldBody = (string) ($officialResponse->getBody() ?? '');
        if ($oldBody !== $newBody) {
            return true;
        }

        $oldAuthorsObject = $officialResponse->getAuthorsObject();
        $oldAuthors = [];
        foreach ($oldAuthorsObject as $author) {
            if (null === $author || null === $author->getId()) {
                continue;
            }

            $authorType = $author instanceof User ? 'User' : 'Organization';
            $oldAuthors[] = GlobalId::toGlobalId($authorType, $author->getId());
        }
        sort($oldAuthors);

        return $oldAuthors !== $newAuthors;
    }

    private function setRefusedReasonIfAny(
        ProposalDecision $proposalDecision,
        Argument $args
    ): ProposalDecision {
        if (false === $args->offsetGet('isApproved') && $args->offsetGet('refusedReason')) {
            $status = $this->statusRepository->find($args->offsetGet('refusedReason'));
            $proposalDecision->setRefusedReason($status);

            return $proposalDecision;
        }

        if (null !== $proposalDecision->getRefusedReason()) {
            $proposalDecision->setRefusedReason(null);
        }

        return $proposalDecision;
    }

    private function setAnalysisAndStatementAsTooLate(Proposal $proposal): Proposal
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
}
