<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Service\VocalContributionFilenameResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class VocalContributionFilenameResolverTest extends TestCase
{
    public function testUsesContributionIdAndMimeExtension(): void
    {
        $user = (new User())->setEmail('author@example.com');
        $vocal = (new VocalContribution())
            ->setId('vocal-id')
            ->setUser($user)
            ->setMedia((new Media())->setContentType('audio/webm'))
        ;

        self::assertSame('vocal-id.webm', (new VocalContributionFilenameResolver())->resolve($vocal));
    }

    public function testUsesContributionIdWhenContributorIsUnknown(): void
    {
        $vocal = (new VocalContribution())
            ->setId('vocal-id')
            ->setMedia((new Media())->setContentType('audio/ogg'))
        ;

        self::assertSame('vocal-id.ogg', (new VocalContributionFilenameResolver())->resolve($vocal));
    }
}
