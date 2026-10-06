<?php

namespace Capco\Tests\GraphQL\Resolver\Ownerable;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Organization\OrganizationAdminAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Ownerable\OwnerableCreatorAccessResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
final class OwnerableCreatorAccessResolverTest extends TestCase
{
    /** @dataProvider viewers */
    public function testCreatorAccessRequiresCreationOrAdministrationRights(string $kind, bool $granted): void
    {
        $viewer = new User();
        $organization = new Organization();
        $project = (new Project())->setCreator(new User())->setOwner($organization);
        if ('admin' === $kind) {
            $viewer->addRole('ROLE_ADMIN');
        } elseif ('creator' === $kind) {
            $project->setCreator($viewer);
        } elseif ('organization admin' === $kind || 'organization member' === $kind) {
            $member = (new OrganizationMember())->setUser($viewer)->setOrganization($organization)->setRole('organization admin' === $kind ? 'admin' : 'user');
            $organization->addMember($member);
        } elseif ('user owner' === $kind) {
            $project->setOwner($viewer);
        }
        $resolver = new OwnerableCreatorAccessResolver(new OrganizationAdminAccessResolver());
        self::assertSame($granted, $resolver($project, 'anonymous' === $kind ? null : $viewer));
    }

    /** @return iterable<string, array{string, bool}> */
    public static function viewers(): iterable
    {
        yield 'anonymous' => ['anonymous', false];
        yield 'administrator' => ['admin', true];
        yield 'creator' => ['creator', true];
        yield 'organization administrator' => ['organization admin', true];
        yield 'ordinary organization member' => ['organization member', false];
        yield 'unrelated user' => ['other', false];
        yield 'owner without creator rights' => ['user owner', false];
    }
}
