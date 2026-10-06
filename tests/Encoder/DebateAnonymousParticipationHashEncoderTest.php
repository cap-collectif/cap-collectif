<?php

namespace Capco\Tests\Encoder;

use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class DebateAnonymousParticipationHashEncoderTest extends TestCase
{
    public function testEncodesAnonymousVote(): void
    {
        $vote = (new DebateAnonymousVote())->setType('FOR')->setToken('supertoken');

        self::assertSame('Rk9SOnN1cGVydG9rZW4=', (new DebateAnonymousParticipationHashEncoder())->encode($vote));
    }

    public function testEncodesAnonymousArgument(): void
    {
        $argument = (new DebateAnonymousArgument(new \Capco\AppBundle\Entity\Debate\Debate()))->setType('FOR')->setToken('supertoken');

        self::assertSame('Rk9SOnN1cGVydG9rZW4=', (new DebateAnonymousParticipationHashEncoder())->encode($argument));
    }

    public function testDecodesHashToTypeAndToken(): void
    {
        $decoded = (new DebateAnonymousParticipationHashEncoder())->decode('Rk9SOnN1cGVydG9rZW4=');

        self::assertSame('FOR', $decoded->getType());
        self::assertSame('supertoken', $decoded->getToken());
    }
}
