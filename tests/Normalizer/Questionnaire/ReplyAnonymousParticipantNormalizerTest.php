<?php

namespace Capco\Tests\Normalizer\Questionnaire;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ReplyAnonymousParticipantNormalizer;
use Capco\AppBundle\Entity\ReplyAnonymous;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class ReplyAnonymousParticipantNormalizerTest extends TestCase
{
    private ReplyAnonymousParticipantNormalizer $normalizer;

    protected function setUp(): void
    {
        parent::setUp();
        $translator = $this->createMock(TranslatorInterface::class);
        $this->normalizer = new ReplyAnonymousParticipantNormalizer($translator);

        $translator->method('trans')
            ->willReturnCallback(fn ($key) => $key)
        ;
    }

    /**
     * @dataProvider normalizationDataProvider
     *
     * @throws ExceptionInterface
     */
    public function testNormalize(mixed $context, mixed $expectedResult): void
    {
        $replyAnonymous = new ReplyAnonymous();
        $replyAnonymous->setId(1);
        $replyAnonymous->setParticipantEmail('amelie.lecoz00@gmail.com');
        $replyAnonymous->setEmailConfirmed(true);

        $result = $this->normalizer->normalize($replyAnonymous, null, $context);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSupportsNormalization(): void
    {
        $this->assertTrue($this->normalizer->supportsNormalization(new ReplyAnonymous(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
        $this->assertFalse($this->normalizer->supportsNormalization(new ReplyAnonymous(), 'csv'));
        $this->assertFalse($this->normalizer->supportsNormalization(new \stdClass(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
    }

    /**
     * @return array<string, array<int, array<string, null|bool|string>>>
     */
    public function normalizationDataProvider(): array
    {
        $simplifiedExportResult = [
            'export_participant_user_id' => null,
            'export_participant_username' => null,
            'export_participant_user_email' => 'amelie.lecoz00@gmail.com',
            'export_participant_consent_internal_communication' => 'Oui',
            'export_participant_phone' => null,
            'export_participant_type' => null,
            'export_participant_firstname' => null,
            'export_participant_lastname' => null,
            'export_participant_date_of_birth' => null,
            'export_participant_postal_address' => null,
            'export_participant_zip_code' => null,
            'export_participant_city' => null,
            'export_participant_profile_url' => null,
            'export_participant_identification_code' => null,
        ];

        $fullExportResult = $simplifiedExportResult + [
            'export_participant_user_created_at' => null,
            'export_participant_user_updated_at' => null,
            'export_participant_user_last_login' => null,
            'export_participant_user_roles_text' => null,
            'export_participant_user_enabled' => null,
            'export_participant_user_is_email_confirmed' => null,
            'export_participant_user_locked' => null,
            'export_participant_user_is_phone_confirmed' => null,
            'export_participant_gender' => null,
            'export_participant_website_url' => null,
            'export_participant_biography' => null,
            'export_participant_is_france_connect_associated' => null,
        ];

        return [
            'Partial Export' => [['is_full_export' => false, BaseNormalizer::IS_EXPORT_NORMALIZER => true], $simplifiedExportResult],
            'Full Export' => [['is_full_export' => true, BaseNormalizer::IS_EXPORT_NORMALIZER => true], $fullExportResult],
        ];
    }
}
