<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class ProjectVoterTest extends AuthorizationTestCase
{
    private const MANAGEMENT_ATTRIBUTES = [ProjectVoter::VIEW, ProjectVoter::EDIT, ProjectVoter::DELETE, ProjectVoter::EXPORT, ProjectVoter::CREATE_PROPOSAL_FROM_BO, ProjectVoter::DUPLICATE];

    public function testAnonymousCannotManageOrCreateProjects(): void
    {
        $token = $this->token('anon.');
        $voter = new ProjectVoter();
        $project = (new Project());
        foreach ([...self::MANAGEMENT_ATTRIBUTES, ProjectVoter::CREATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $project, [$attribute]));
        }
    }

    public function testAdministratorCanPerformEveryProjectAction(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $voter = new ProjectVoter();
        $token = $this->token($admin);
        $project = (new Project());
        foreach ([...self::MANAGEMENT_ATTRIBUTES, ProjectVoter::CREATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $project, [$attribute]));
        }
    }

    public function testProjectAdminCanManageTheirOwnProjectOnly(): void
    {
        $admin = (new User());

        $admin->addRole('ROLE_PROJECT_ADMIN');
        $token = $this->token($admin);
        $owned = (new Project());
        $owned->setOwner($admin);
        $voter = new ProjectVoter();
        foreach (self::MANAGEMENT_ATTRIBUTES as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $owned, [$attribute]));
        }
        $other = (new Project());
        $other->setOwner(null);
        foreach (self::MANAGEMENT_ATTRIBUTES as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $other, [$attribute]));
        }
    }

    public function testOrganizationMemberCanCreateAndManageButNotDeleteProject(): void
    {
        $member = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $member->addMemberOfOrganization($membership);
        $owner = (new Organization());
        $membership->setUser($member)->setOrganization($owner);
        $owner->addMember($membership);
        $project = (new Project());
        $project->setOwner($owner);

        $voter = new ProjectVoter();
        $token = $this->token($member);
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $project, [ProjectVoter::CREATE]));
        foreach ([ProjectVoter::VIEW, ProjectVoter::EDIT, ProjectVoter::EXPORT, ProjectVoter::CREATE_PROPOSAL_FROM_BO, ProjectVoter::DUPLICATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $project, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $project, [ProjectVoter::DELETE]));
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationAdminOrProjectCreatorCanDeleteProject(string $role): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole($role);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $project = (new Project());
        $project->setOwner($organization);
        $project->setCreator(OrganizationMemberRoleType::USER === $role ? $user : new User());

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new ProjectVoter())->vote($this->token($user), $project, [ProjectVoter::DELETE]));
    }

    public function testRandomUserCannotManageAnotherOrganizationsProjectAndUnsupportedInputsAbstain(): void
    {
        $user = (new User());

        $project = (new Project());
        $project->setOwner(null);
        $voter = new ProjectVoter();
        foreach ([...self::MANAGEMENT_ATTRIBUTES, ProjectVoter::CREATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($user), $project, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($this->token($user), $project, ['unknown']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($this->token($user), new Post(), [ProjectVoter::VIEW]));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
