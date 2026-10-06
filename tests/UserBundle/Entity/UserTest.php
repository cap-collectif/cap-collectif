<?php

namespace Capco\Tests\UserBundle\Entity;

use Capco\AppBundle\Entity\Opinion;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class UserTest extends TestCase
{
    public function testContributionsIncludeOpinions(): void
    {
        $user = new User();
        $opinion = new Opinion();
        $user->setOpinions(new ArrayCollection([$opinion]));

        self::assertSame([$opinion], $user->getContributions());
    }
}
