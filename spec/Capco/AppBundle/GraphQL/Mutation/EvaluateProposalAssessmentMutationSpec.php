<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Mutation\EvaluateProposalAssessmentMutation;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class EvaluateProposalAssessmentMutationSpec extends ObjectBehavior
{
    public function let(
        ProposalRepository $proposalRepository,
        AuthorizationChecker $authorizationChecker,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        Publisher $publisher
    ) {
        $this->beConstructedWith(
            $proposalRepository,
            $authorizationChecker,
            $entityManager,
            $logger,
            $publisher
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EvaluateProposalAssessmentMutation::class);
    }

    public function it_publish_message_on_new_decision(
        Argument $argument,
        ProposalRepository $proposalRepository,
        Proposal $proposal,
        AuthorizationChecker $authorizationChecker,
        Publisher $publisher,
        User $viewer
    ): void {
        $argument->offsetGet('proposalId')->willReturn('proposalId');
        $argument->offsetGet('decision')->willReturn(ProposalStatementState::FAVOURABLE);
        $argument->offsetGet('body')->willReturn('body');
        $argument->offsetGet('estimatedCost')->willReturn(0);
        $argument->offsetGet('officialResponse')->willReturn('officialResponse');

        $this->fixtures($proposalRepository, $authorizationChecker, $proposal);

        $publisher->publish(\Prophecy\Argument::any(), \Prophecy\Argument::any())->shouldBeCalled();

        $this->__invoke($argument, $viewer);
    }

    public function it_does_not_publish_message_on_if_no_decision(
        Argument $argument,
        ProposalRepository $proposalRepository,
        Proposal $proposal,
        AuthorizationChecker $authorizationChecker,
        Publisher $publisher,
        User $viewer
    ): void {
        $argument->offsetGet('proposalId')->willReturn('proposalId');
        $argument->offsetGet('decision')->willReturn(ProposalStatementState::IN_PROGRESS);
        $argument->offsetGet('body')->willReturn('body');
        $argument->offsetGet('estimatedCost')->willReturn(0);
        $argument->offsetGet('officialResponse')->willReturn('officialResponse');

        $this->fixtures($proposalRepository, $authorizationChecker, $proposal);

        $publisher
            ->publish(\Prophecy\Argument::any(), \Prophecy\Argument::any())
            ->shouldNotBeCalled();

        $this->__invoke($argument, $viewer);
    }

    private function fixtures($proposalRepository, $authorizationChecker, $proposal): void
    {
        $proposalRepository->find(\Prophecy\Argument::any())->willReturn($proposal);
        $authorizationChecker
            ->isGranted(ProposalAnalysisRelatedVoter::EVALUATE, $proposal)
            ->willReturn(true);
        $proposal->getAnalyses()->willReturn(new ArrayCollection([]));
        $proposal->getAssessment()->willReturn(null);
        $proposal->getDecision()->willReturn(null);
        $proposal->addAnalysis(\Prophecy\Argument::any())->willReturn($proposal);
        $proposal->setAssessment(\Prophecy\Argument::any())->willReturn($proposal);
        $proposal->getId()->willReturn('proposalId');
    }
}
