<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\AnalysisConfigurationProcess;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\Manager\AnalysisConfigurationManager;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Slack\JpecGhost;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class AnalysisConfigurationManagerSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $entityManager,
        ProposalRepository $proposalRepository,
        ProposalDecisionRepository $proposalDecisionRepository,
        EventDispatcherInterface $eventDispatcher,
        Publisher $publisher,
        JpecGhost $jpecGhost
    ) {
        $this->beConstructedWith(
            $entityManager,
            $proposalRepository,
            $proposalDecisionRepository,
            $eventDispatcher,
            $publisher,
            $jpecGhost
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AnalysisConfigurationManager::class);
    }

    public function it_processes_without_proposals(
        AnalysisConfiguration $config,
        ProposalForm $proposalForm,
        ProposalRepository $proposalRepository,
        EntityManagerInterface $entityManager,
        JpecGhost $jpecGhost
    ) {
        $config->getProposalForm()->willReturn($proposalForm);
        $proposalRepository
            ->findByProposalForm($proposalForm)
            ->shouldBeCalled()
            ->willReturn([])
        ;
        $config->setEffectiveDateProcessed(true)->shouldBeCalled();
        $entityManager
            ->persist(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;
        $entityManager->flush()->shouldBeCalled();
        $jpecGhost
            ->generateAndSendMessage(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;

        $this->processAnalysisConfiguration($config, true)->shouldReturn(0);
    }

    public function it_processes_with_proposals_without_decisions(
        AnalysisConfiguration $config,
        ProposalForm $proposalForm,
        ProposalRepository $proposalRepository,
        ProposalDecisionRepository $proposalDecisionRepository,
        EntityManagerInterface $entityManager,
        JpecGhost $jpecGhost
    ) {
        $config->getProposalForm()->willReturn($proposalForm);
        $proposalRepository
            ->findByProposalForm($proposalForm)
            ->shouldBeCalled()
            ->willReturn(['proposalId'])
        ;
        $proposalDecisionRepository
            ->findUserProcessedProposalByIds(['proposalId'])
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection())
        ;
        $config->setEffectiveDateProcessed(true)->shouldBeCalled();
        $entityManager
            ->persist(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;
        $entityManager->flush()->shouldBeCalled();
        $jpecGhost
            ->generateAndSendMessage(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;

        $this->processAnalysisConfiguration($config, true)->shouldReturn(0);
    }

    public function it_processes_with_decisions(
        AnalysisConfiguration $config,
        ProposalForm $proposalForm,
        ProposalDecision $proposalDecisionPositive,
        ProposalDecision $proposalDecisionNegative,
        Proposal $proposalPositive,
        Proposal $proposalNegative,
        ProposalRepository $proposalRepository,
        ProposalDecisionRepository $proposalDecisionRepository,
        EntityManagerInterface $entityManager,
        JpecGhost $jpecGhost,
        EventDispatcherInterface $eventDispatcher,
        Publisher $publisher
    ) {
        $config->getProposalForm()->willReturn($proposalForm);
        $proposalDecisionPositive->getProposal()->willReturn($proposalPositive);
        $proposalDecisionPositive->isApproved()->willReturn(true);
        $proposalDecisionNegative->getProposal()->willReturn($proposalNegative);
        $proposalDecisionNegative->isApproved()->willReturn(false);
        $proposalRepository
            ->findByProposalForm($proposalForm)
            ->shouldBeCalled()
            ->willReturn(['proposalPositive', 'proposalNegative', 'proposalUndecided'])
        ;
        $proposalDecisionRepository
            ->findUserProcessedProposalByIds([
                'proposalPositive',
                'proposalNegative',
                'proposalUndecided',
            ])
            ->shouldBeCalled()
            ->willReturn([$proposalDecisionPositive, $proposalDecisionNegative])
        ;
        $config->setEffectiveDateProcessed(true)->shouldBeCalled();
        $entityManager
            ->persist(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;
        $entityManager->flush()->shouldBeCalled();
        $jpecGhost
            ->generateAndSendMessage(Argument::type(AnalysisConfigurationProcess::class))
            ->shouldBeCalled()
        ;
        $eventDispatcher
            ->dispatch(
                Argument::type(DecisionEvent::class),
                CapcoAppBundleEvents::DECISION_APPROVED
            )
            ->shouldBeCalled()
        ;
        $eventDispatcher
            ->dispatch(
                Argument::type(DecisionEvent::class),
                CapcoAppBundleEvents::DECISION_REFUSED
            )
            ->shouldBeCalled()
        ;
        $publisher
            ->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
                Argument::type(Message::class)
            )
            ->shouldBeCalled()
        ;

        $this->processAnalysisConfiguration($config, true)->shouldReturn(2);
    }
}
