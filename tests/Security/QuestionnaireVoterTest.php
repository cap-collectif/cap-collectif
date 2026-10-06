<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class QuestionnaireVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotPerformQuestionnaireActions(): void
    {
        $token = $this->token('anon.');
        $questionnaire = (new Questionnaire());
        $voter = new QuestionnaireVoter();
        foreach ([QuestionnaireVoter::CREATE, QuestionnaireVoter::VIEW, QuestionnaireVoter::EDIT, QuestionnaireVoter::DELETE, QuestionnaireVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $questionnaire, [$attribute]));
        }
    }

    public function testAdminCanPerformEveryQuestionnaireAction(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $voter = new QuestionnaireVoter();
        foreach ([QuestionnaireVoter::CREATE, QuestionnaireVoter::VIEW, QuestionnaireVoter::EDIT, QuestionnaireVoter::DELETE, QuestionnaireVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($admin), (new Questionnaire()), [$attribute]));
        }
    }

    public function testProjectAdminCanManageOwnedQuestionnaireOnly(): void
    {
        $user = (new User());

        $user->addRole('ROLE_PROJECT_ADMIN');
        $voter = new QuestionnaireVoter();
        $owned = (new Questionnaire());
        $owned->setOwner($user);
        foreach ([QuestionnaireVoter::VIEW, QuestionnaireVoter::EDIT, QuestionnaireVoter::DELETE, QuestionnaireVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $owned, [$attribute]));
        }
        $other = (new Questionnaire());
        $other->setOwner(null);
        foreach ([QuestionnaireVoter::VIEW, QuestionnaireVoter::EDIT, QuestionnaireVoter::DELETE, QuestionnaireVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($user), $other, [$attribute]));
        }
    }

    public function testOrganizationMemberCanCreateViewEditAndExportButCannotDelete(): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $user->addMemberOfOrganization($membership);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $questionnaire = (new Questionnaire());
        $questionnaire->setOwner($organization);

        $token = $this->token($user);
        $voter = new QuestionnaireVoter();
        foreach ([QuestionnaireVoter::CREATE, QuestionnaireVoter::VIEW, QuestionnaireVoter::EDIT, QuestionnaireVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $questionnaire, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $questionnaire, [QuestionnaireVoter::DELETE]));
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationCreatorAndAdminCanDeleteQuestionnaire(string $role): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole($role);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $questionnaire = (new Questionnaire());
        $questionnaire->setOwner($organization);
        $questionnaire->setCreator(OrganizationMemberRoleType::USER === $role ? $user : new User());
        self::assertSame(VoterInterface::ACCESS_GRANTED, (new QuestionnaireVoter())->vote($this->token($user), $questionnaire, [QuestionnaireVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $voter = new QuestionnaireVoter();
        $token = $this->token(new User());
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new Project(), [QuestionnaireVoter::DELETE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new Questionnaire()), ['unknown']));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
