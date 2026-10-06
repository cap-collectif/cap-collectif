<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class EventVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCanOnlyViewPublicEvents(): void
    {
        $token = $this->token('anon.');
        $event = (new Event());
        $event->setEnabled(true);
        $voter = new EventVoter($this->createStub(Manager::class));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [EventVoter::VIEW_FRONT]));
        foreach ([EventVoter::CREATE, EventVoter::VIEW_ADMIN, EventVoter::EDIT, EventVoter::DELETE, EventVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $event, [$attribute]));
        }
        $hiddenEvent = (new Event());
        $hiddenEvent->setEnabled(false);
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $hiddenEvent, [EventVoter::VIEW_FRONT]));
    }

    /** @dataProvider reviewVisibility */
    public function testAnonymousVisibilityFollowsTheEventReviewEvenWhenEnabled(string $status, int $expected): void
    {
        $event = (new Event())->setEnabled(true)->setReview((new \Capco\AppBundle\Entity\EventReview())->setStatus($status));
        $voter = new EventVoter($this->createStub(Manager::class));

        self::assertSame($expected, $voter->vote($this->token('anon.'), $event, [EventVoter::VIEW_FRONT]));
    }

    /** @return iterable<string, array{string, int}> */
    public static function reviewVisibility(): iterable
    {
        yield 'approved event' => [\Capco\AppBundle\DBAL\Enum\EventReviewStatusType::APPROVED, VoterInterface::ACCESS_GRANTED];
        yield 'awaiting review' => [\Capco\AppBundle\DBAL\Enum\EventReviewStatusType::AWAITING, VoterInterface::ACCESS_DENIED];
        yield 'refused event' => [\Capco\AppBundle\DBAL\Enum\EventReviewStatusType::REFUSED, VoterInterface::ACCESS_DENIED];
    }

    public function testAdministratorCanManageAnyEvent(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $event = (new Event());
        $token = $this->token($admin);
        $voter = new EventVoter($this->createStub(Manager::class));
        foreach ([EventVoter::CREATE, EventVoter::VIEW_ADMIN, EventVoter::EDIT, EventVoter::DELETE, EventVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [$attribute]));
        }
    }

    public function testProjectAdminCanManageEventsTheyOwnOnly(): void
    {
        $user = (new User());

        $user->addRole('ROLE_PROJECT_ADMIN');
        $event = (new Event());
        $event->setOwner($user);
        $event->setEnabled(false);
        $token = $this->token($user);
        $voter = new EventVoter($this->createStub(Manager::class));
        foreach ([EventVoter::VIEW_FRONT, EventVoter::VIEW_ADMIN, EventVoter::EDIT, EventVoter::DELETE, EventVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [$attribute]));
        }
        $otherEvent = (new Event());
        $otherEvent->setOwner(null);
        $otherEvent->setEnabled(false);
        foreach ([EventVoter::VIEW_FRONT, EventVoter::VIEW_ADMIN, EventVoter::EDIT, EventVoter::DELETE, EventVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $otherEvent, [$attribute]));
        }
    }

    /** @dataProvider eventCreationFlags */
    public function testOrdinaryAccountCanCreateEventsOnlyWhenTheFeatureIsEnabled(bool $enabled, int $expected): void
    {
        $user = new User();
        $manager = $this->createStub(Manager::class);
        $manager->method('isActive')->willReturn($enabled);
        $voter = new EventVoter($manager);

        self::assertSame($expected, $voter->vote($this->token($user), new Event(), [EventVoter::CREATE]));
    }

    /** @return iterable<string, array{bool, int}> */
    public static function eventCreationFlags(): iterable
    {
        yield 'event creation enabled' => [true, VoterInterface::ACCESS_GRANTED];
        yield 'event creation disabled' => [false, VoterInterface::ACCESS_DENIED];
    }

    public function testOwnerCanManageTheirEventButCannotViewItInAdmin(): void
    {
        $user = (new User());

        $event = (new Event());
        $event->setEnabled(false);
        $event->setOwner($user);
        $token = $this->token($user);
        $voter = new EventVoter($this->createStub(Manager::class));
        foreach ([EventVoter::VIEW_FRONT, EventVoter::EDIT, EventVoter::DELETE, EventVoter::EXPORT] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [$attribute]));
        }
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $event, [EventVoter::VIEW_ADMIN]));
    }

    public function testOrganizationMemberCanCreateViewAndEditButCannotDeleteEvent(): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole(OrganizationMemberRoleType::USER);
        $user->addMemberOfOrganization($membership);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $event = (new Event());
        $event->setEnabled(false);
        $event->setOwner($organization);

        $token = $this->token($user);
        $voter = new EventVoter($this->createStub(Manager::class));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [EventVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [EventVoter::VIEW_FRONT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [EventVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $event, [EventVoter::EXPORT]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $event, [EventVoter::VIEW_ADMIN]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $event, [EventVoter::DELETE]));
    }

    /** @dataProvider organizationDeletionRoles */
    public function testOrganizationCreatorOrAdminCanDeleteOwnedEvent(string $role): void
    {
        $user = (new User());

        $membership = (new OrganizationMember());
        $membership->setRole($role);
        $organization = (new Organization());
        $membership->setUser($user)->setOrganization($organization);
        $organization->addMember($membership);
        $event = (new Event());
        $event->setOwner($organization);
        $event->setCreator(OrganizationMemberRoleType::USER === $role ? $user : new User());
        $token = $this->token($user);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new EventVoter($this->createStub(Manager::class)))->vote($token, $event, [EventVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $voter = new EventVoter($this->createStub(Manager::class));
        $token = $this->createStub(TokenInterface::class);
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [EventVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new Event()), ['unknown']));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
