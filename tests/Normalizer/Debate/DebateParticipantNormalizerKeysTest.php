<?php

namespace Capco\Tests\Normalizer\Debate;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\DebateAnonymousArgumentNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class DebateParticipantNormalizerKeysTest extends KernelTestCase
{
    private User $user;
    private DebateAnonymousArgument $anonymousArgument;
    private ?object $participantNormalizer;
    private ?object $anonymousArgumentNormalizer;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->user = new User();
        $debate = new Debate();
        $this->anonymousArgument = new DebateAnonymousArgument($debate);
        $this->anonymousArgument->setEmail('amelie@lecoz.com');

        $container = self::$container;

        $this->participantNormalizer = $container->get(ParticipantNormalizer::class);
        $this->anonymousArgumentNormalizer = $container->get(DebateAnonymousArgumentNormalizer::class);
    }

    public function testExportDebateParticipantNormalizersHaveSameKeys(): void
    {
        $userNormalizedData = $this->participantNormalizer->normalize($this->user);
        $anonymousArgumentNormalizedData = $this->anonymousArgumentNormalizer->normalize($this->anonymousArgument);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($anonymousArgumentNormalizedData),
            'The keys of the two normalized arrays are not the same.
            Check the normalizers used for the debate participant simplified export.'
        );
    }

    public function testFullExportQuestionnaireParticipantNormalizersHaveSameKeys(): void
    {
        $userNormalizedData = $this->participantNormalizer->normalize($this->user, null, [BaseNormalizer::IS_FULL_EXPORT => true]);
        $anonymousArgumentNormalizedData = $this->anonymousArgumentNormalizer->normalize($this->anonymousArgument, null, [BaseNormalizer::IS_FULL_EXPORT => true]);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($anonymousArgumentNormalizedData),
            'The keys of the two normalized arrays are not the same.
            Check the normalizers used for the debate participant full export.'
        );
    }
}
