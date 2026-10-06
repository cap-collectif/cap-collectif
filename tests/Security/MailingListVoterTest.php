<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\MailingListVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class MailingListVoterTest extends AuthorizationTestCase
{
    /** @dataProvider unprivilegedViewers */
    public function testAnonymousAndBasicUsersCannotViewOrDelete(bool $authenticated): void
    {
        $viewer = $authenticated ? new User() : 'anon.';
        $voter = new MailingListVoter();
        $list = (new MailingList());
        $list->setOwner(null);
        $list->setIsDeletable(true);
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($viewer), $list, [MailingListVoter::VIEW]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($viewer), $list, [MailingListVoter::DELETE]));
    }

    public function testAdministratorCanViewAndDeleteOnlyDeletableLists(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $voter = new MailingListVoter();
        $token = $this->token($admin);
        $list = (new MailingList());
        $list->setIsDeletable(true);
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $list, [MailingListVoter::VIEW]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $list, [MailingListVoter::DELETE]));
        $protectedList = (new MailingList());
        $protectedList->setIsDeletable(false);
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $protectedList, [MailingListVoter::DELETE]));
    }

    public function testOwnerCanViewAndDeleteDeletableList(): void
    {
        $owner = (new User());

        $list = (new MailingList());
        $list->setOwner($owner);
        $list->setIsDeletable(true);
        $voter = new MailingListVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($owner), $list, [MailingListVoter::VIEW]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($owner), $list, [MailingListVoter::DELETE]));
    }

    /** @dataProvider organizationMemberships */
    public function testOrganizationDeletionRequiresCreatorOrAdminRightsAndADeletableList(string $role, bool $creator, bool $deletable, int $deletion): void
    {
        $user = new User();
        $organization = new Organization();
        $membership = (new OrganizationMember())->setRole($role)->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $list = (new MailingList())->setOwner($organization)->setCreator($creator ? $user : new User())->setIsDeletable($deletable);
        $voter = new MailingListVoter();

        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $list, [MailingListVoter::VIEW]));
        self::assertSame($deletion, $voter->vote($this->token($user), $list, [MailingListVoter::DELETE]));
    }

    /** @return iterable<string, array{string, bool, bool, int}> */
    public static function organizationMemberships(): iterable
    {
        yield 'ordinary member without creator rights' => [OrganizationMemberRoleType::USER, false, true, VoterInterface::ACCESS_DENIED];
        yield 'creator of a deletable list' => [OrganizationMemberRoleType::USER, true, true, VoterInterface::ACCESS_GRANTED];
        yield 'creator of a protected list' => [OrganizationMemberRoleType::USER, true, false, VoterInterface::ACCESS_DENIED];
        yield 'administrator of a deletable list' => [OrganizationMemberRoleType::ADMIN, false, true, VoterInterface::ACCESS_GRANTED];
        yield 'administrator of a protected list' => [OrganizationMemberRoleType::ADMIN, false, false, VoterInterface::ACCESS_DENIED];
    }

    /** @dataProvider mailingListCreators */
    public function testAdminProjectAdminAndOrganizationMemberCanCreate(string $role, bool $member): void
    {
        $user = (new User())->addRole($role);
        if ($member) {
            $user->addMemberOfOrganization((new OrganizationMember())->setUser($user)->setOrganization(new Organization()));
        }

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new MailingListVoter())->vote($this->token($user), new MailingList(), [MailingListVoter::CREATE]));
    }

    /** @return iterable<string, array{string, bool}> */
    public static function mailingListCreators(): iterable
    {
        yield 'administrator' => ['ROLE_ADMIN', false];
        yield 'project administrator' => ['ROLE_PROJECT_ADMIN', false];
        yield 'organization member' => ['ROLE_USER', true];
    }

    public function testItAbstainsForUnsupportedInputs(): void
    {
        $voter = new MailingListVoter();
        $token = $this->token(new User());
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new MailingList()), ['unknown']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [MailingListVoter::VIEW]));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
