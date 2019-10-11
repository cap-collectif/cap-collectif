<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResponsesResolver;

class ProposalResponsesResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalResponsesResolver::class);
    }

    public function it_should_return_all_responses_when_acl_are_disabled(
        Proposal $proposal,
        User $author,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $proposal->getResponses()->willReturn($responses);
        $proposal->getAuthor()->willReturn($author);
        $this->__invoke($proposal, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_return_all_responses_when_viewer_is_author(
        Proposal $proposal,
        User $author,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = $author;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $proposal->getResponses()->willReturn($responses);
        $proposal->getAuthor()->willReturn($author);
        $this->__invoke($proposal, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_not_return_private_responses_when_viewer_is_anonymous(
        Proposal $proposal,
        User $author,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $proposal->getResponses()->willReturn($responses);
        $proposal->getAuthor()->willReturn($author);
        $this->__invoke($proposal, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }

    public function it_should_not_return_private_responses_when_viewer_is_not_author(
        Proposal $proposal,
        User $author,
        User $viewer,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getResponses()->willReturn($responses);
        $proposal->getAuthor()->willReturn($author);
        $this->__invoke($proposal, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }
}
