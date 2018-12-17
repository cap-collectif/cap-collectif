<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\UserRequirement;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\AppBundle\GraphQL\Resolver\Requirement\RequirementViewerValueResolver;
use PhpSpec\ObjectBehavior;

class RequirementViewerValueResolverSpec extends ObjectBehavior
{
    public function let(UserRequirementRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(RequirementViewerValueResolver::class);
    }

    public function it_resolve_firstname(Requirement $requirement, User $user): void
    {
        $requirement->getType()->willReturn(Requirement::FIRSTNAME);
        $user->getFirstname()->willReturn('John');
        $this($requirement, $user)->shouldReturn('John');
    }

    public function it_resolve_lastname(Requirement $requirement, User $user): void
    {
        $requirement->getType()->willReturn(Requirement::LASTNAME);
        $user->getLastname()->willReturn('Doe');
        $this($requirement, $user)->shouldReturn('Doe');
    }

    public function it_resolve_phone(Requirement $requirement, User $user): void
    {
        $requirement->getType()->willReturn(Requirement::PHONE);
        $user->getPhone()->willReturn('+33628353289');
        $this($requirement, $user)->shouldReturn('+33628353289');
    }

    public function it_resolve_date_of_birth(Requirement $requirement, User $user): void
    {
        $requirement->getType()->willReturn(Requirement::DATE_OF_BIRTH);
        $date = new \DateTime();
        $user->getDateOfBirth()->willReturn($date);
        $this($requirement, $user)->shouldReturn($date);
    }

    public function it_resolve_checkbox_agreed(
        UserRequirementRepository $repository,
        UserRequirement $ur,
        Requirement $requirement,
        User $user
    ): void {
        $requirement->getType()->willReturn(Requirement::CHECKBOX);
        $ur->getValue()->willReturn(true);
        $repository->findOneBy(['requirement' => $requirement, 'user' => $user])->willReturn($ur);
        $this($requirement, $user)->shouldReturn(true);
    }

    public function it_resolve_checkbox_not_agreed(
        UserRequirementRepository $repository,
        Requirement $requirement,
        User $user
    ): void {
        $requirement->getType()->willReturn(Requirement::CHECKBOX);
        $repository->findOneBy(['requirement' => $requirement, 'user' => $user])->willReturn(null);
        $this($requirement, $user)->shouldReturn(false);
    }
}
