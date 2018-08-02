<?php
namespace spec\Capco\AppBundle\GraphQL\Resolver\Publishable;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\GraphQL\Resolver\Publishable\PublishableNotPublishedReasonResolver;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\NotPublishedReason;

class PublishableNotPublishedReasonResolverSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(PublishableNotPublishedReasonResolver::class);
    }

    function it_resolve_null_if_published(Publishable $publishable)
    {
        $publishable->isPublished()->willReturn(true);
        $this->__invoke($publishable)->shouldReturn(null);
    }

    function it_resolve_null_if_no_author(Publishable $publishable)
    {
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn(null);
        $this->__invoke($publishable)->shouldReturn(null);
    }

    function it_resolve_ACCOUNT_CONFIRMED_TOO_LATE_if_author_is_confirmed(
        Publishable $publishable,
        User $author
    ) {
        $author->isEmailConfirmed()->willReturn(true);
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $this->__invoke($publishable)->shouldReturn(NotPublishedReason::ACCOUNT_CONFIRMED_TOO_LATE);
    }

    function it_resolve_WAITING_AUTHOR_CONFIRMATION_if_step_is_null(
        Publishable $publishable,
        User $author
    ) {
        $author->isEmailConfirmed()->willReturn(false);
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $publishable->getStep()->willReturn(null);
        $this->__invoke($publishable)->shouldReturn(
            NotPublishedReason::WAITING_AUTHOR_CONFIRMATION
        );
    }

    function it_resolve_WAITING_AUTHOR_CONFIRMATION_if_step_is_open(
        Publishable $publishable,
        User $author,
        AbstractStep $step
    ) {
        $step->isOpen()->willReturn(true);
        $author->isEmailConfirmed()->willReturn(false);
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $publishable->getStep()->willReturn($step);
        $this->__invoke($publishable)->shouldReturn(
            NotPublishedReason::WAITING_AUTHOR_CONFIRMATION
        );
    }

    function it_resolve_AUTHOR_NOT_CONFIRMED_if_step_is_open(
        Publishable $publishable,
        User $author,
        AbstractStep $step
    ) {
        $step->isOpen()->willReturn(false);
        $author->isEmailConfirmed()->willReturn(false);
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $publishable->getStep()->willReturn($step);
        $this->__invoke($publishable)->shouldReturn(NotPublishedReason::AUTHOR_NOT_CONFIRMED);
    }
}
