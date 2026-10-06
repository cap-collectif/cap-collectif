<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\CanSetOwner;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class CanSetOwnerTest extends AuthorizationTestCase
{
    public function testAdminCanSetAnyOwner(): void
    {
        $viewer = (new User());
        $viewer->addRole('ROLE_ADMIN');

        self::assertTrue(CanSetOwner::check(new User(), $viewer));
        self::assertTrue(CanSetOwner::check(new Organization(), $viewer));
    }

    public function testUserCanSetThemselfAsOwner(): void
    {
        $viewer = (new User());

        self::assertTrue(CanSetOwner::check($viewer, $viewer));
    }

    public function testUserCannotSetAnotherUserAsOwner(): void
    {
        $viewer = (new User());

        self::assertFalse(CanSetOwner::check(new User(), $viewer));
    }

    public function testOrganizationMemberCanSetOrganizationAsOwner(): void
    {
        $viewer = (new User());

        $organization = (new Organization());
        $organization->addMember((new OrganizationMember())->setUser($viewer)->setOrganization($organization));

        self::assertTrue(CanSetOwner::check($organization, $viewer));
    }

    public function testNonMemberCannotSetOrganizationAsOwner(): void
    {
        $viewer = (new User());

        $organization = (new Organization());

        self::assertFalse(CanSetOwner::check($organization, $viewer));
    }
}
