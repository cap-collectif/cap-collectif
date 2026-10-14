<?php

namespace Capco\Tests\Entity;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Vocal contribution ownership and initial status are domain rules.
 */
final class VocalContributionTest extends TestCase
{
    public function testNewContributionWaitsForRequirementValidation(): void
    {
        self::assertSame(
            ContributionCompletionStatus::MISSING_REQUIREMENTS,
            (new VocalContribution())->getCompletionStatus()
        );
    }

    public function testContributorAssignmentKeepsOneCurrentOwner(): void
    {
        $contribution = new VocalContribution();
        $user = new User();
        $participant = new Participant();

        $contribution->setContributor($user);
        self::assertSame($user, $contribution->getUser());
        self::assertNull($contribution->getParticipant());

        $contribution->setContributor($participant);
        self::assertSame($participant, $contribution->getParticipant());
        self::assertNull($contribution->getUser());
    }
}
