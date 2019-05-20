<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\User\UserResponsesResolver;

class UserResponsesResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserResponsesResolver::class);
    }

    public function it_should_return_all_responses_when_acl_are_disabled(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);
        $this->__invoke($subject, $viewer, $context)->shouldBeLike(
            ConnectionBuilder::connectionFromArray($responses->toArray())
        );
    }

    public function it_should_return_all_responses_when_viewer_is_subject(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = $subject;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);
        $this->__invoke($subject, $viewer, $context)->shouldBeLike(
            ConnectionBuilder::connectionFromArray($responses->toArray())
        );
    }

    public function it_should_not_return_private_responses_when_viewer_is_anonymous(
        User $subject,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $subject->getResponses()->willReturn($responses);
        $this->__invoke($subject, $viewer, $context)->shouldReturnEmptyConnection();
    }

    public function it_should_not_return_private_responses_when_viewer_is_not_subject(
        User $subject,
        User $viewer,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $viewer->isAdmin()->willReturn(false);
        $subject->getResponses()->willReturn($responses);
        $this->__invoke($subject, $viewer, $context)->shouldReturnEmptyConnection();
    }
}
