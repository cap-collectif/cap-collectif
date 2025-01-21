<?php

namespace Capco\Tests\Normalizer\Questionnaire;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Serializer\ReplyAnonymousParticipantNormalizer;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class QuestionnaireParticipantNormalizerKeysTest extends KernelTestCase
{
    private User $user;
    private ReplyAnonymous $anonymousReply;
    private ?object $userNormalizer;
    private ?object $replyAnonymousNormalizer;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->user = new User();
        $this->anonymousReply = new ReplyAnonymous();

        $container = self::$container;

        $this->userNormalizer = $container->get(ParticipantNormalizer::class);
        $this->replyAnonymousNormalizer = $container->get(ReplyAnonymousParticipantNormalizer::class);
    }

    public function testSimplifiedExportQuestionnaireParticipantNormalizersHaveSameKeys(): void
    {
        $userNormalizedData = $this->userNormalizer->normalize($this->user);
        $replyAnonymousNormalizedData = $this->replyAnonymousNormalizer->normalize($this->anonymousReply);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($replyAnonymousNormalizedData),
            'The keys of the two normalizers are not the same.
            Check the normalizers used for the questionnaire participant simplified export.'
        );
    }

    public function testFullExportQuestionnaireParticipantNormalizersHaveSameKeys(): void
    {
        $userNormalizedData = $this->userNormalizer->normalize($this->user, null, [BaseNormalizer::IS_FULL_EXPORT => true]);
        $replyAnonymousNormalizedData = $this->replyAnonymousNormalizer->normalize($this->anonymousReply, null, [BaseNormalizer::IS_FULL_EXPORT => true]);

        $this->assertSame(
            array_keys($userNormalizedData),
            array_keys($replyAnonymousNormalizedData),
            'The keys of the two normalizers are not the same.
            Check the normalizers used for the questionnaire participant full export.'
        );
    }
}
