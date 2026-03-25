<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\ToggleFeatureAccessResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class ToggleFeatureAccessResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ToggleFeatureAccessResolver::class);
    }

    public function it_denies_super_admin_only_flags_to_non_super_admin(User $user): void
    {
        $user->isAdmin()->willReturn(true);
        $user->isSuperAdmin()->willReturn(false);

        $this->isGranted(Manager::new_project_page, $user)->shouldReturn(false);
    }

    public function it_allows_super_admin_only_flags_to_super_admin(User $user): void
    {
        $user->isAdmin()->willReturn(true);
        $user->isSuperAdmin()->willReturn(true);

        $this->isGranted(Manager::new_project_page, $user)->shouldReturn(true);
    }
}
