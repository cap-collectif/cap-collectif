<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class PostVoterTest extends AuthorizationTestCase
{
    public function testAnonymousIsDeniedForPostOperations(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');
        $post = (new Post());
        $voter = new PostVoter();

        foreach ([PostVoter::CREATE, PostVoter::EDIT, PostVoter::DELETE, PostVoter::VIEW] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $post, [$attribute]));
        }
    }

    public function testAdministratorCanPerformAllPostOperations(): void
    {
        $user = (new User());
        $user->addRole('ROLE_ADMIN');
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $voter = new PostVoter();
        $post = (new Post());

        foreach ([PostVoter::CREATE, PostVoter::EDIT, PostVoter::DELETE, PostVoter::VIEW] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [$attribute]));
        }
    }

    public function testProjectAdminCanCreateButCannotManageSomeoneElsesPost(): void
    {
        $user = (new User());

        $user->addRole('ROLE_PROJECT_ADMIN');
        $post = (new Post());
        $post->setOwner(null);

        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $voter = new PostVoter();

        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [PostVoter::CREATE]));
        foreach ([PostVoter::EDIT, PostVoter::DELETE, PostVoter::VIEW] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $post, [$attribute]));
        }
    }

    public function testOrganizationMemberCanEditAndViewButNotDeletePosts(): void
    {
        $user = (new User());

        $organization = (new Organization());
        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $membership->setUser($user)->setOrganization($organization);
        $user->addMemberOfOrganization($membership);
        $organization->addMember($membership);
        $post = (new Post());
        $post->setOwner($organization);

        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $voter = new PostVoter();

        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [PostVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [PostVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [PostVoter::VIEW]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $post, [PostVoter::DELETE]));
    }

    /** @dataProvider ownershipContexts */
    public function testProjectAdminCanManagePostsTheyOwnOrWhoseProjectTheyOwn(bool $throughProject): void
    {
        $viewer = (new User())->addRole('ROLE_PROJECT_ADMIN');
        $post = new Post();
        if ($throughProject) {
            $post->setOwner(new User());
            $post->addProject((new \Capco\AppBundle\Entity\Project())->setOwner($viewer));
        } else {
            $post->setOwner($viewer);
        }
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);
        $voter = new PostVoter();

        foreach ([PostVoter::VIEW, PostVoter::EDIT, PostVoter::DELETE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $post, [$attribute]));
        }
    }

    /** @return iterable<string, array{bool}> */
    public static function ownershipContexts(): iterable
    {
        yield 'post owner' => [false];
        yield 'associated project owner' => [true];
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationCreatorOrAdminCanDeletePost(string $role): void
    {
        $viewer = new User();
        $organization = new Organization();
        $membership = (new OrganizationMember())->setRole($role)->setUser($viewer)->setOrganization($organization);
        $organization->addMember($membership);
        $post = (new Post())->setOwner($organization)->setCreator(OrganizationMemberRoleType::USER === $role ? $viewer : new User());
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new PostVoter())->vote($token, $post, [PostVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $voter = new PostVoter();
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [PostVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new Post()), ['unknown']));
    }
}
