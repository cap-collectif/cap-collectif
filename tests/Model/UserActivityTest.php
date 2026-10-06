<?php

namespace Capco\Tests\Model;

use Capco\AppBundle\Model\UserActivity;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class UserActivityTest extends TestCase
{
    public function testCanAddUserOpinions(): void
    {
        $activity = new UserActivity();
        $activity->addUserOpinion('opinion1', 'ALL');
        $activity->addUserOpinion('opinion2', 'ALL');

        self::assertSame([
            'opinion1' => 'ALL',
            'opinion2' => 'ALL',
        ], $activity->getUserOpinions());
    }

    public function testAddingAnOpinionReplacesOnlyItsVisibility(): void
    {
        $activity = new UserActivity();
        $activity->addUserOpinion('opinion1', 'ALL');
        $activity->addUserOpinion('opinion2', 'ALL');
        $activity->addUserOpinion('opinion1', 'AUTHOR');
        self::assertSame(['opinion1' => 'AUTHOR', 'opinion2' => 'ALL'], $activity->getUserOpinions());
    }
}
