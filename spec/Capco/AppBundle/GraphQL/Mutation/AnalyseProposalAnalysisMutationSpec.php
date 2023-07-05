<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Mutation\AnalyseProposalAnalysisMutation;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class AnalyseProposalAnalysisMutationSpec extends ObjectBehavior
{
    public function let(
        ProposalRepository $proposalRepository,
        AuthorizationChecker $authorizationChecker,
        ProposalAnalysisRepository $analysisRepository,
        LoggerInterface $logger,
        ResponsesFormatter $responsesFormatter,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        Publisher $publisher
    ) {
        $this->beConstructedWith(
            $proposalRepository,
            $authorizationChecker,
            $analysisRepository,
            $logger,
            $responsesFormatter,
            $entityManager,
            $formFactory,
            $publisher
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(AnalyseProposalAnalysisMutation::class);
    }

    public function it_publish_message_on_new_decision(
        Argument $argument,
        ProposalRepository $proposalRepository,
        Proposal $proposal,
        AuthorizationChecker $authorizationChecker,
        ProposalAnalysisRepository $analysisRepository,
        ResponsesFormatter $responsesFormatter,
        User $viewer,
        Publisher $publisher,
        FormFactory $formFactory,
        Form $form
    ): void {
        $this->fixtures(
            $viewer,
            $authorizationChecker,
            $analysisRepository,
            $proposalRepository,
            $proposal,
            $responsesFormatter,
            $formFactory,
            $form
        );

        $argument->offsetGet('proposalId')->willReturn('proposalId');
        $argument->offsetGet('decision')->willReturn(ProposalStatementState::FAVOURABLE);
        $argument->offsetGet('responses')->willReturn([]);
        $argument->offsetGet('comment')->willReturn(null);

        $publisher
            ->publish(CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE, \Prophecy\Argument::any())
            ->shouldBeCalled()
        ;

        $this->__invoke($argument, $viewer);
    }

    public function it_does_not_publish_message_if_no_decision(
        Argument $argument,
        ProposalRepository $proposalRepository,
        Proposal $proposal,
        AuthorizationChecker $authorizationChecker,
        ProposalAnalysisRepository $analysisRepository,
        ResponsesFormatter $responsesFormatter,
        User $viewer,
        Publisher $publisher,
        FormFactory $formFactory,
        Form $form
    ): void {
        $this->fixtures(
            $viewer,
            $authorizationChecker,
            $analysisRepository,
            $proposalRepository,
            $proposal,
            $responsesFormatter,
            $formFactory,
            $form
        );

        $argument->offsetGet('proposalId')->willReturn('proposalId');
        $argument->offsetGet('decision')->willReturn(ProposalStatementState::IN_PROGRESS);
        $argument->offsetGet('responses')->willReturn([]);
        $argument->offsetGet('comment')->willReturn(null);

        $publisher
            ->publish(CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE, \Prophecy\Argument::any())
            ->shouldNotBeCalled()
        ;

        $this->__invoke($argument, $viewer);
    }

    private static function fixtures(
        $viewer,
        $authorizationChecker,
        $analysisRepository,
        $proposalRepository,
        $proposal,
        $responsesFormatter,
        $formFactory,
        $form
    ): void {
        $authorizationChecker
            ->isGranted(ProposalAnalysisRelatedVoter::ANALYSE, $proposal)
            ->willReturn(true)
        ;
        $analysisRepository
            ->findOneBy([
                'proposal' => $proposal,
                'updatedBy' => $viewer,
            ])
            ->willReturn(null)
        ;
        $proposalRepository->find('proposalId')->willReturn($proposal);
        $proposalRepository->find(null)->willReturn($proposal);
        $proposal->getDecision()->willReturn(null);
        $proposal->addAnalysis(\Prophecy\Argument::any())->willReturn($proposal);
        $proposal->getId()->willReturn('proposalId');
        $responsesFormatter->format([])->willReturn([]);
        $formFactory
            ->create(
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any()
            )
            ->willReturn($form)
        ;
        $form->isValid()->willReturn(true);
        $form->submit(\Prophecy\Argument::any(), \Prophecy\Argument::any())->willReturn($form);
    }
}
