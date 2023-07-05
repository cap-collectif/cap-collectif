<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Reply\ReplyViewerCanUpdateResolver;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class ReplyViewerCanUpdateResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ReplyViewerCanUpdateResolver::class);
    }

    public function it_should_return_false_if_not_author(
        Reply $reply,
        User $author,
        User $notAuthor
    ): void {
        $reply->getAuthor()->willReturn($author);
        $this->__invoke($reply, $notAuthor)->shouldReturn(false);
    }

    public function it_should_return_false_if_not_contribuable(
        Reply $reply,
        User $author,
        Questionnaire $questionnaire
    ): void {
        $reply->getAuthor()->willReturn($author);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $questionnaire->canContribute($author)->willReturn(false);
        $this->__invoke($reply, $author)->shouldReturn(false);
    }

    public function it_should_return_true_if_author_and_contribuable(
        Reply $reply,
        User $author,
        Questionnaire $questionnaire
    ): void {
        $reply->getAuthor()->willReturn($author);
        $reply->getQuestionnaire()->willReturn($questionnaire);
        $questionnaire->canContribute($author)->willReturn(true);
        $this->__invoke($reply, $author)->shouldReturn(true);
    }
}
