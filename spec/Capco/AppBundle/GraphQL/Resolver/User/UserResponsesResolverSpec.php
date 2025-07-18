<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Resolver\User\UserResponsesResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use PhpSpec\ObjectBehavior;

class UserResponsesResolverSpec extends ObjectBehavior
{
    public function let(ConnectionBuilderInterface $builder)
    {
        $this->beConstructedWith($builder);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserResponsesResolver::class);
    }

    public function it_should_return_all_responses_when_acl_are_disabled(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question,
        ConnectionBuilderInterface $builder,
        ConnectionInterface $connection
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $question->isPrivate()->willReturn(true);
        $question->getHidden()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);

        $builder
            ->connectionFromArray($responses->toArray())
            ->willReturn($connection)
            ->shouldBeCalled()
        ;
        $this->__invoke($subject, $viewer, $context)->shouldReturn($connection);
    }

    public function it_should_return_private_responses_when_viewer_is_subject(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question,
        ConnectionBuilderInterface $builder,
        ConnectionInterface $connection
    ): void {
        $viewer = $subject;
        $viewer->isAdmin()->willReturn(false);
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getHidden()->willReturn(false);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);

        $builder
            ->connectionFromArray($responses->toArray())
            ->willReturn($connection)
            ->shouldBeCalled()
        ;
        $this->__invoke($subject, $viewer, $context)->shouldReturn($connection);
    }

    public function it_should_not_return_hidden_responses_when_viewer_is_subject(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question,
        ConnectionBuilderInterface $builder,
        ConnectionInterface $emptyConnection
    ): void {
        $viewer = $subject;
        $viewer->isAdmin()->willReturn(false);
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(false);
        $question->getHidden()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);

        $builder
            ->connectionFromArray([])
            ->willReturn($emptyConnection)
            ->shouldBeCalled()
        ;
        $this->__invoke($subject, $viewer, $context)->shouldReturn($emptyConnection);
    }

    public function it_should_not_return_private_responses_when_viewer_is_anonymous(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question,
        ConnectionBuilderInterface $builder,
        ConnectionInterface $emptyConnection
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getHidden()->willReturn(false);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);

        $builder
            ->connectionFromArray([])
            ->willReturn($emptyConnection)
            ->shouldBeCalled()
        ;
        $this->__invoke($subject, $viewer, $context)->shouldReturn($emptyConnection);
    }

    public function it_should_not_return_private_responses_when_viewer_is_not_subject(
        User $subject,
        User $viewer,
        AbstractResponse $response,
        AbstractQuestion $question,
        ConnectionBuilderInterface $builder,
        ConnectionInterface $emptyConnection
    ): void {
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $question->getHidden()->willReturn(false);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $viewer->isAdmin()->willReturn(false);
        $subject->getResponses()->willReturn($responses);

        $builder
            ->connectionFromArray([])
            ->willReturn($emptyConnection)
            ->shouldBeCalled()
        ;
        $this->__invoke($subject, $viewer, $context)->shouldReturn($emptyConnection);
    }
}
