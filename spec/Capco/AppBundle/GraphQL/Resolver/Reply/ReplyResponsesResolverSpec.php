<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Reply;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
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

    public function it_should_return_all_responses_when_acl_are_disabled(
        Reply $reply,
        User $author,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => true]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $reply->getResponses()->willReturn($responses);
        $reply->getAuthor()->willReturn($author);
        $this->__invoke($reply, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_return_all_responses_when_viewer_is_author(
        Reply $reply,
        User $author,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = $author;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getResponses()->willReturn($responses);
        $reply->getAuthor()->willReturn($author);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $this->__invoke($reply, $viewer, $context)->shouldBeLike($responses->getIterator());
    }

    public function it_should_not_return_private_responses_when_viewer_is_anonymous(
        Reply $reply,
        User $author,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $viewer = null;
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getResponses()->willReturn($responses);
        $reply->getAuthor()->willReturn($author);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $this->__invoke($reply, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }

    public function it_should_not_return_private_responses_when_viewer_is_not_author(
        Reply $reply,
        User $author,
        User $viewer,
        Questionnaire $questionnaire,
        AbstractResponse $response,
        AbstractQuestion $question
    ): void {
        $context = new \ArrayObject(['disable_acl' => false]);
        $question->isPrivate()->willReturn(true);
        $response->getQuestion()->willReturn($question);
        $responses = new ArrayCollection([$response->getWrappedObject()]);
        $viewer->isAdmin()->willReturn(false);
        $questionnaire->isPrivateResult()->willReturn(false);
        $reply->getResponses()->willReturn($responses);
        $reply->getAuthor()->willReturn($author);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $this->__invoke($reply, $viewer, $context)->shouldBeLike(
            (new ArrayCollection([]))->getIterator()
        );
    }
}
