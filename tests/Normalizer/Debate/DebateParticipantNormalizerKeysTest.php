<?php

namespace Capco\Tests\Normalizer\Debate;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\DebateAnonymousArgumentNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Enum\ExportVariantsEnum;
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
        $userNormalizedData = $this->participantNormalizer->normalize($this->user, null, [BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL]);
        $anonymousArgumentNormalizedData = $this->anonymousArgumentNormalizer->normalize($this->anonymousArgument, null, [BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL]);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($anonymousArgumentNormalizedData),
            'The keys of the two normalized arrays are not the same.
            Check the normalizers used for the debate participant simplified export.'
        );
    }

    public function testFullExportQuestionnaireParticipantNormalizersHaveSameKeys(): void
    {
        $userNormalizedData = $this->participantNormalizer->normalize($this->user, null, [BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL]);
        $anonymousArgumentNormalizedData = $this->anonymousArgumentNormalizer->normalize($this->anonymousArgument, null, [BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL]);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($anonymousArgumentNormalizedData),
            'The keys of the two normalized arrays are not the same.
            Check the normalizers used for the debate participant full export.'
        );
    }
}
