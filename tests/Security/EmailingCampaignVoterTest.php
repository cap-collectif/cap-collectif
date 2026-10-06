<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class EmailingCampaignVoterTest extends AuthorizationTestCase
{
    private const MANAGEMENT = [EmailingCampaignVoter::VIEW, EmailingCampaignVoter::EDIT, EmailingCampaignVoter::DELETE, EmailingCampaignVoter::SEND, EmailingCampaignVoter::TEST, EmailingCampaignVoter::CANCEL];

    /** @dataProvider unprivilegedViewers */
    public function testAnonymousAndBasicUsersCannotManageCampaigns(bool $authenticated): void
    {
        $voter = new EmailingCampaignVoter();
        $campaign = (new EmailingCampaign());
        $campaign->setOwner(null);
        $viewer = $authenticated ? new User() : 'anon.';
        foreach (self::MANAGEMENT as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($viewer), $campaign, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($viewer), $campaign, [EmailingCampaignVoter::CREATE]));
    }

    public function testAdministratorCanManageAnyCampaign(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $voter = new EmailingCampaignVoter();
        $campaign = (new EmailingCampaign());
        foreach ([...self::MANAGEMENT, EmailingCampaignVoter::CREATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($admin), $campaign, [$attribute]));
        }
    }

    public function testProjectAdminCanManageTheirOwnCampaignAndCanOnlyCreateOthers(): void
    {
        $user = (new User());

        $user->addRole('ROLE_PROJECT_ADMIN');
        $voter = new EmailingCampaignVoter();
        $owned = (new EmailingCampaign());
        $owned->setOwner($user);
        foreach ([...self::MANAGEMENT, EmailingCampaignVoter::CREATE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $owned, [$attribute]));
        }
        $other = (new EmailingCampaign());
        $other->setOwner(null);
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $other, [EmailingCampaignVoter::CREATE]));
        foreach (self::MANAGEMENT as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($user), $other, [$attribute]));
        }
    }

    public function testOrganizationMemberCanCreateViewEditSendButCannotDelete(): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $user->addMemberOfOrganization($membership);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $campaign = (new EmailingCampaign());
        $campaign->setOwner($organization);

        $voter = new EmailingCampaignVoter();
        foreach ([EmailingCampaignVoter::CREATE, EmailingCampaignVoter::VIEW, EmailingCampaignVoter::EDIT, EmailingCampaignVoter::SEND, EmailingCampaignVoter::TEST, EmailingCampaignVoter::CANCEL] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $campaign, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($user), $campaign, [EmailingCampaignVoter::DELETE]));
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationCreatorOrAdminCanDeleteCampaign(string $role): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole($role);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $campaign = (new EmailingCampaign());
        $campaign->setOwner($organization);
        $campaign->setCreator(OrganizationMemberRoleType::USER === $role ? $user : new User());

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new EmailingCampaignVoter())->vote($this->token($user), $campaign, [EmailingCampaignVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedInputs(): void
    {
        $voter = new EmailingCampaignVoter();
        $token = $this->token(new User());
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new EmailingCampaign()), ['unknown']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [EmailingCampaignVoter::CREATE]));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
