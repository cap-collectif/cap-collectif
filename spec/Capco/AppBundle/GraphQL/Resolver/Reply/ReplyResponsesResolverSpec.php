<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Reply;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Reply;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyResponsesResolver;

class ReplyResponsesResolverSpec extends ObjectBehavior
{
    public function let(LoggerInterface $logger)
    {
        $this->beConstructedWith($logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ReplyResponsesResolver::class);
    }

    public function it_should_return_responses_when_acl_are_disabled(Reply $reply): void
    {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $responses = new ArrayCollection();
        $reply->getResponses()->willReturn($responses);
        $this->__invoke($reply, $viewer, $context)->shouldReturn($responses);
    }
}
