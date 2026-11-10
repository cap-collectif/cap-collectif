<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Event\DecisionEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

final class ImmediatelyEffectiveDecisionFlowStrategy implements DecisionFlowStrategyInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Indexer $indexer,
        private readonly EventDispatcherInterface $eventDispatcher,
        private readonly DecisionFlowSideEffectsService $decisionFlowSideEffectsService
    ) {}

    public function execute(DecisionFlowContext $context): ?string
    {
        $transitionContext = $context->transitionContext;
        $shouldPublishOfficialResponseWithoutEvent
            = !$transitionContext->shouldDispatchFinalizationEvent
            && $transitionContext->wasDone
            && $transitionContext->isDoneRequested
            && $this->hasUnpublishedOfficialResponse($context->proposalDecision);
        $shouldReindexPublishedOfficialResponseWithoutEvent
            = !$transitionContext->shouldDispatchFinalizationEvent
            && $transitionContext->wasDone
            && $transitionContext->isDoneRequested
            && $transitionContext->hasOfficialResponseContentChanged
            && $this->hasPublishedOfficialResponse($context->proposalDecision);

        if ($shouldPublishOfficialResponseWithoutEvent) {
            $context->proposalDecision->getOfficialResponse()->setIsPublished(true);
        }

        if ($transitionContext->shouldDispatchFinalizationEvent) {
            $this->dispatchEvent($context);
        }

        $this->entityManager->flush();

        if ($shouldPublishOfficialResponseWithoutEvent || $shouldReindexPublishedOfficialResponseWithoutEvent) {
            $this->indexer->index(
                Post::class,
                $context->proposalDecision->getOfficialResponse()->getId()
            );
        }

        $this->decisionFlowSideEffectsService->handlePostFlush(
            $context->proposal,
            $context->oldState,
            $context->proposalDecision
        );

        return null;
    }

    private function hasUnpublishedOfficialResponse(ProposalDecision $proposalDecision): bool
    {
        $officialResponse = $proposalDecision->getOfficialResponse();

        return null !== $officialResponse && !$officialResponse->isPublished();
    }

    private function hasPublishedOfficialResponse(ProposalDecision $proposalDecision): bool
    {
        $officialResponse = $proposalDecision->getOfficialResponse();

        return null !== $officialResponse && $officialResponse->isPublished();
    }

    private function dispatchEvent(DecisionFlowContext $context): void
    {
        $decision = $context->args->offsetGet('isApproved')
            ? CapcoAppBundleEvents::DECISION_APPROVED
            : CapcoAppBundleEvents::DECISION_REFUSED;
        $event = new DecisionEvent(
            $context->proposal,
            $context->proposal->getDecision(),
            $context->proposal->getProposalForm()->getAnalysisConfiguration()
        );
        $this->eventDispatcher->dispatch($event, $decision);
    }
}
