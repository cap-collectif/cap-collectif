<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Security\EventReviewVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class EventReviewVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotEditAnEventReview(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');

        self::assertSame(VoterInterface::ACCESS_DENIED, (new EventReviewVoter())->vote($token, (new EventReview()), [EventReviewVoter::EDIT]));
    }

    public function testSuperAdminCanEditAnyEventReview(): void
    {
        $user = (new User());
        $user->addRole('ROLE_SUPER_ADMIN');
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new EventReviewVoter())->vote($token, (new EventReview()), [EventReviewVoter::EDIT]));
    }

    /** @dataProvider reviewStatuses */
    public function testAdminCanEditOnlyAwaitingReviews(string $status, int $expected): void
    {
        $user = (new User())->addRole('ROLE_ADMIN');
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $review = (new EventReview())->setStatus($status);

        self::assertSame($expected, (new EventReviewVoter())->vote($token, $review, [EventReviewVoter::EDIT]));
    }

    /** @return iterable<string, array{string, int}> */
    public static function reviewStatuses(): iterable
    {
        yield 'awaiting review' => [EventReviewStatusType::AWAITING, VoterInterface::ACCESS_GRANTED];
        yield 'refused review' => [EventReviewStatusType::REFUSED, VoterInterface::ACCESS_DENIED];
        yield 'approved review' => [EventReviewStatusType::APPROVED, VoterInterface::ACCESS_DENIED];
        yield 'deleted review' => [EventReviewStatusType::DELETED, VoterInterface::ACCESS_DENIED];
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $voter = new EventReviewVoter();
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [EventReviewVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new EventReview()), ['unknown']));
    }
}
