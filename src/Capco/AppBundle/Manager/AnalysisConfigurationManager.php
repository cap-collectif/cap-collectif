<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\AnalysisConfigurationProcess;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Slack\JpecGhost;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class AnalysisConfigurationManager
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly ProposalRepository $proposalRepository, private readonly ProposalDecisionRepository $proposalDecisionRepository, private readonly EventDispatcherInterface $eventDispatcher, private readonly Publisher $publisher, private readonly JpecGhost $jpecGhost)
    {
    }

    public function processAnalysisConfiguration(
        AnalysisConfiguration $config,
        bool $sendMessage
    ): int {
        $proposalCount = 0;

        $proposalDecisions = $this->getProposalDecisions($config);
        foreach ($proposalDecisions as $proposalDecision) {
            if ($proposalDecision->getProposal()) {
                ++$proposalCount;
                $this->dispatchDecisionEvent($config, $proposalDecision);

                if ($sendMessage) {
                    $this->publishMessage($proposalDecision->getProposal());
                }
            }
        }
        $config->setEffectiveDateProcessed(true);
        $process = $this->registerProcess($config, $proposalDecisions);
        $this->entityManager->flush();
        $this->logToSlack($process);

        return $proposalCount;
    }

    private function getProposalDecisions(AnalysisConfiguration $config): iterable
    {
        $proposalsLinkedToFormIds = $this->proposalRepository->findByProposalForm(
            $config->getProposalForm()
        );

        if (empty($proposalsLinkedToFormIds)) {
            return new ArrayCollection();
        }

        return $this->proposalDecisionRepository->findUserProcessedProposalByIds(
            $proposalsLinkedToFormIds
        );
    }

    private function dispatchDecisionEvent(
        AnalysisConfiguration $config,
        ProposalDecision $decision
    ): void {
        $this->eventDispatcher->dispatch(
            $decision->isApproved()
                ? CapcoAppBundleEvents::DECISION_APPROVED
                : CapcoAppBundleEvents::DECISION_REFUSED,
            new DecisionEvent($decision->getProposal(), $decision, $config)
        );
    }

    private function publishMessage(Proposal $proposal): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
            new Message(
                json_encode([
                    'proposalId' => $proposal->getId(),
                    'date' => new \DateTime(),
                ])
            )
        );
    }

    private function registerProcess(
        AnalysisConfiguration $analysisConfiguration,
        iterable $decisions
    ): AnalysisConfigurationProcess {
        $process = new AnalysisConfigurationProcess();
        $process->setAnalysisConfiguration($analysisConfiguration);
        foreach ($decisions as $decision) {
            $process->addDecision($decision);
        }
        $this->entityManager->persist($process);

        return $process;
    }

    private function logToSlack(AnalysisConfigurationProcess $process): void
    {
        $this->jpecGhost->generateAndSendMessage($process);
    }
}
