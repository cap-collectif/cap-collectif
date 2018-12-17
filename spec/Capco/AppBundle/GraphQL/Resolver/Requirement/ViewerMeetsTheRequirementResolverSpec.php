<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementViewerValueResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerMeetsTheRequirementResolver;
use PhpSpec\ObjectBehavior;

class ViewerMeetsTheRequirementResolverSpec extends ObjectBehavior
{
    public function let(RequirementViewerValueResolver $resolver)
    {
        $this->beConstructedWith($resolver);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ViewerMeetsTheRequirementResolver::class);
    }

    public function it_resolve_date_requirement_meets(
        RequirementViewerValueResolver $resolver,
        Requirement $requirement,
        User $user
    ): void {
        $resolver->__invoke($requirement, $user)->willReturn(new \DateTime());
        $requirement->getType()->willReturn(Requirement::DATE_OF_BIRTH);

        $this($requirement, $user)->shouldReturn(true);
    }

    public function it_resolve_firstname_requirement_meets(
        RequirementViewerValueResolver $resolver,
        Requirement $requirement,
        User $user
    ): void {
        $resolver->__invoke($requirement, $user)->willReturn('John');
        $requirement->getType()->willReturn(Requirement::FIRSTNAME);
        $this($requirement, $user)->shouldReturn(true);
    }

    public function it_resolve_checkbox_requirement_meets(
        RequirementViewerValueResolver $resolver,
        Requirement $requirement,
        User $user
    ): void {
        $resolver->__invoke($requirement, $user)->willReturn(true);
        $requirement->getType()->willReturn(Requirement::CHECKBOX);
        $this($requirement, $user)->shouldReturn(true);
    }

    public function it_resolve_not_meet(
        RequirementViewerValueResolver $resolver,
        Requirement $requirement,
        User $user
    ): void {
        $resolver->__invoke($requirement, $user)->willReturn(null);
        $this($requirement, $user)->shouldReturn(false);
    }
}
