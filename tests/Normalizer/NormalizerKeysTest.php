<?php

namespace Capco\Tests\Normalizer;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Serializer\ReplyAnonymousNormalizer;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class NormalizerKeysTest extends KernelTestCase
{
    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testExportParticipantNormalizersHaveSameKeys()
    {
        $participant = new User();
        $anonymousReply = new ReplyAnonymous();

        $container = self::$container;

        $participantNormalizer = $container->get(ParticipantNormalizer::class);
        $replyAnonymousNormalizer = $container->get(ReplyAnonymousNormalizer::class);

        $firstNormalizedData = $participantNormalizer->normalize($participant);
        $secondNormalizedData = $replyAnonymousNormalizer->normalize($anonymousReply);

        $firstKeys = array_keys($firstNormalizedData);
        $secondKeys = array_keys($secondNormalizedData);

        $this->assertSame($firstKeys, $secondKeys, 'The keys of the two normalized arrays are not the same.');
    }

    public function testFullExportParticipantNormalizersHaveSameKeys()
    {
        $participant = new User();
        $anonymousReply = new ReplyAnonymous();

        $container = self::$container;

        $participantNormalizer = $container->get(ParticipantNormalizer::class);
        $replyAnonymousNormalizer = $container->get(ReplyAnonymousNormalizer::class);

        $firstNormalizedData = $participantNormalizer->normalize($participant, null, [BaseNormalizer::IS_FULL_EXPORT => true]);
        $secondNormalizedData = $replyAnonymousNormalizer->normalize($anonymousReply, null, [BaseNormalizer::IS_FULL_EXPORT => true]);

        $firstKeys = array_keys($firstNormalizedData);
        $secondKeys = array_keys($secondNormalizedData);

        $this->assertSame($firstKeys, $secondKeys, 'The keys of the two normalized arrays are not the same.');
    }
}
