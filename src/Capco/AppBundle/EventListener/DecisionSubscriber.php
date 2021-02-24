<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\Repository\SelectionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class DecisionSubscriber implements EventSubscriberInterface
{
    private SelectionRepository $selectionRepository;
    private EntityManagerInterface $entityManager;
    private Indexer $indexer;

    public function __construct(
        SelectionRepository $selectionRepository,
        EntityManagerInterface $entityManager,
        Indexer $indexer
    ) {
        $this->selectionRepository = $selectionRepository;
        $this->entityManager = $entityManager;
        $this->indexer = $indexer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CapcoAppBundleEvents::DECISION_APPROVED => 'onDecisionApproved',
            CapcoAppBundleEvents::DECISION_REFUSED => 'onDecisionRefused',
        ];
    }

    public function publishPostIfAny(ProposalDecision $decision): void
    {
        if ($officialResponsePost = $decision->getOfficialResponse()) {
            $officialResponsePost->setIsPublished(true);
            $this->entityManager->flush();
            $this->indexer->index(Post::class, $officialResponsePost->getId());
            $this->indexer->finishBulk();
        }
    }

    public function onDecisionApproved(DecisionEvent $decisionEvent): void
    {
        $proposal = $decisionEvent->getProposal();
        $decision = $decisionEvent->getDecision();
        $analysisConfig = $decisionEvent->getAnalysisConfig();
        $analysisStep = $analysisConfig->getAnalysisStep();

        $this->applyCostDecision($analysisConfig, $decision, $proposal);

        $favourableStatus = $analysisConfig->getFavourableStatus();
        $moveToStep = $analysisConfig->getMoveToSelectionStep();

        // Let's publish official response
        $this->publishPostIfAny($decision);

        // Let's apply favourable status
        $this->applyProposalStatus($proposal, $analysisStep, $favourableStatus);

        // Let's apply move
        if ($moveToStep) {
            $moveToselection = $this->selectionRepository->findOneBy([
                'proposal' => $proposal,
                'selectionStep' => $moveToStep,
            ]);
            if (!$moveToselection) {
                $moveToselection = new Selection();
                $moveToselection->setSelectionStep($moveToStep);
                $moveToselection->setStatus($analysisConfig->getSelectionStepStatus());
                $proposal->addSelection($moveToselection);
                $this->entityManager->persist($moveToselection);
            }
        }

        $this->indexer->index(Proposal::class, $proposal->getId());
        $this->indexer->finishBulk();
    }

    public function onDecisionRefused(DecisionEvent $decisionEvent): void
    {
        $proposal = $decisionEvent->getProposal();
        $decision = $decisionEvent->getDecision();
        $analysisConfig = $decisionEvent->getAnalysisConfig();
        $analysisStep = $analysisConfig->getAnalysisStep();

        // Let's publish official response
        $this->publishPostIfAny($decision);

        $this->applyCostDecision($analysisConfig, $decision, $proposal);

        $refusedStatus = $decision->getRefusedReason();

        // Let's apply refused status
        $this->applyProposalStatus($proposal, $analysisStep, $refusedStatus);

        $this->indexer->index(Proposal::class, $proposal->getId());
        $this->indexer->finishBulk();
    }

    private function applyProposalStatus(
        Proposal $proposal,
        AbstractStep $step,
        ?Status $status
    ): void {
        if ($status) {
            if ($step instanceof SelectionStep) {
                $analysisSelection = $this->selectionRepository->findOneBy([
                    'proposal' => $proposal,
                    'selectionStep' => $step,
                ]);
                if (!$analysisSelection) {
                    throw new \RuntimeException('This should not happen', 1);
                }
                $analysisSelection->setStatus($status);
            }
            if ($step instanceof CollectStep) {
                $proposal->setStatus($status);
            }
        }
    }

    private function applyCostDecision(
        AnalysisConfiguration $analysisConfig,
        ProposalDecision $decision,
        Proposal $proposal
    ): void {
        if ($analysisConfig->isCostEstimationEnabled()) {
            $estimatedCost = $decision->getEstimatedCost();

            if ($estimatedCost) {
                $proposal->setEstimation($estimatedCost);
            }
        }
    }
}
