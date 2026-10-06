<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalFormVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class ProposalFormVoterTest extends AuthorizationTestCase
{
    private const ACTIONS = [ProposalFormVoter::VIEW, ProposalFormVoter::EDIT, ProposalFormVoter::DUPLICATE, ProposalFormVoter::IMPORT_PROPOSALS];

    public function testAnonymousCannotUseProposalFormActions(): void
    {
        $voter = new ProposalFormVoter();
        foreach ([...self::ACTIONS, ProposalFormVoter::CREATE, ProposalFormVoter::DELETE] as $action) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token('anon.'), (new ProposalForm()), [$action]));
        }
    }

    public function testAdminCanUseAllProposalFormActions(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $voter = new ProposalFormVoter();
        foreach ([...self::ACTIONS, ProposalFormVoter::CREATE, ProposalFormVoter::DELETE] as $action) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($admin), (new ProposalForm()), [$action]));
        }
    }

    public function testProjectAdminCanAccessOwnedFormsOnly(): void
    {
        $admin = (new User());

        $admin->addRole('ROLE_PROJECT_ADMIN');
        $owned = (new ProposalForm());
        $owned->setOwner($admin);
        $other = (new ProposalForm());
        $other->setOwner(null);
        $voter = new ProposalFormVoter();
        foreach ([...self::ACTIONS, ProposalFormVoter::DELETE] as $action) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($admin), $owned, [$action]));
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($admin), $other, [$action]));
        }
    }

    public function testOrganizationMemberCanCreateViewEditAndDuplicateButCannotDelete(): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $user->addMemberOfOrganization($membership);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $form = (new ProposalForm());
        $form->setOwner($organization);

        $voter = new ProposalFormVoter();
        foreach ([ProposalFormVoter::CREATE, ProposalFormVoter::VIEW, ProposalFormVoter::EDIT, ProposalFormVoter::DUPLICATE] as $action) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $form, [$action]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($user), $form, [ProposalFormVoter::DELETE]));
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationCreatorOrAdminCanDeleteProposalForm(string $role): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole($role);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $form = (new ProposalForm());
        $form->setOwner($organization);
        $form->setCreator(OrganizationMemberRoleType::USER === $role ? $user : new User());
        self::assertSame(VoterInterface::ACCESS_GRANTED, (new ProposalFormVoter())->vote($this->token($user), $form, [ProposalFormVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $voter = new ProposalFormVoter();
        $token = $this->token(new User());
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new ProposalForm()), ['unknown']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new Proposal(), [ProposalFormVoter::EDIT]));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
