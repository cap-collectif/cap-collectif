<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\GraphQL\Mutation\ReportMutation;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Prophecy\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class ReportMutationSpec extends ObjectBehavior
{
    public function let(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        Publisher $publisher
    ) {
        $this->beConstructedWith($globalIdResolver, $em, $publisher);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ReportMutation::class);
    }

    public function it_reports(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        Publisher $publisher,
        Arg $input,
        DebateArgument $debateArgument,
        User $viewer
    ) {
        $id = 'debateArgumentId';
        $input->offsetGet('reportableId')->willReturn($id);
        $input->offsetGet('body')->willReturn('nul');
        $input->offsetGet('type')->willReturn(2);

        $globalIdResolver->resolve($id, $viewer)->willReturn($debateArgument);
        $debateArgument->getReports()->willReturn(new ArrayCollection());
        $debateArgument->addReport(Argument::type(Reporting::class))->willReturn($debateArgument);

        $em->persist(Argument::type(Reporting::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $publisher
            ->publish(CapcoAppBundleMessagesTypes::REPORT, Argument::type(Message::class))
            ->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload['report']->getReporter()->shouldBe($viewer);
        $payload['report']->getRelatedObject()->shouldBe($debateArgument);
    }

    public function it_fails_on_invalid_id(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        User $viewer
    ) {
        $id = 'wrongId';
        $input->offsetGet('reportableId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn(null);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'REPORTABLE_NOT_FOUND']);
    }

    public function it_fails_on_non_reportable_entity(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        User $viewer
    ) {
        $id = 'wrongId';
        $input->offsetGet('reportableId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($viewer);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'REPORTABLE_NOT_FOUND']);
    }

    public function it_fails_if_already_reported(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateArgument $debateArgument,
        User $viewer,
        Reporting $report
    ) {
        $id = 'debateArgumentId';
        $input->offsetGet('reportableId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debateArgument);
        $debateArgument->getReports()->willReturn([$report]);
        $report->getReporter()->willReturn($viewer);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'ALREADY_REPORTED']);
    }
}
