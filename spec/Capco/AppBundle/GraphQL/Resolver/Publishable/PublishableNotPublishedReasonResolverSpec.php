<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Publishable;

use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\GraphQL\Resolver\Publishable\PublishableNotPublishedReasonResolver;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\NotPublishedReason;

class PublishableNotPublishedReasonResolverSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(PublishableNotPublishedReasonResolver::class);
    }

    public function it_resolve_null_if_published(Publishable $publishable)
    {
        $publishable->isPublished()->willReturn(true);
        $this->__invoke($publishable)->shouldReturn(null);
    }

    public function it_resolve_null_if_no_author(Publishable $publishable)
    {
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn(null);
        $this->__invoke($publishable)->shouldReturn(null);
    }

    public function it_resolve_ACCOUNT_CONFIRMED_TOO_LATE_if_author_is_confirmed(
        Publishable $publishable,
        User $author
    ) {
        $author->isEmailConfirmed()->willReturn(true);
        $publishable->isPublished()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $this->__invoke($publishable)->shouldReturn(NotPublishedReason::ACCOUNT_CONFIRMED_TOO_LATE);
    }

    public function it_resolve_WAITING_AUTHOR_CONFIRMATION_if_step_is_null(
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

    public function it_resolve_WAITING_AUTHOR_CONFIRMATION_if_step_is_open(
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

    public function it_resolve_AUTHOR_NOT_CONFIRMED_if_step_is_open(
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

    public function it_resolve_null_if_is_draft(Publishable $publishable)
    {
        $publishable->implement(DraftableInterface::class);
        $publishable->isPublished()->willReturn(false);
        $publishable->isDraft()->willReturn(true);
        $this->__invoke($publishable)->shouldReturn(null);
    }
}
