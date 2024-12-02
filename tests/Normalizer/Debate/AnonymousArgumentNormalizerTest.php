<?php

namespace Capco\Tests\Normalizer\Debate;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\DebateAnonymousArgumentNormalizer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class AnonymousArgumentNormalizerTest extends TestCase
{
    private DebateAnonymousArgumentNormalizer $normalizer;

    protected function setUp(): void
    {
        parent::setUp();
        $translator = $this->createMock(TranslatorInterface::class);
        $this->normalizer = new DebateAnonymousArgumentNormalizer($translator);

        $translator->method('trans')
            ->willReturnCallback(function ($key) {
                return $key;
            })
        ;
    }

    /**
     * @dataProvider normalizationDataProvider
     *
     * @throws ExceptionInterface
     */
    public function testNormalize(mixed $context, mixed $expectedResult)
    {
        $debate = new Debate();
        $anonymousArgument = new DebateAnonymousArgument($debate);
        $anonymousArgument->setId(1);
        $anonymousArgument->setEmail('amelie.lecoz00@gmail.com');
        $anonymousArgument->setConsentInternalCommunication(true);

        $result = $this->normalizer->normalize($anonymousArgument, null, $context);

        $this->assertIsArray($result);
        $this->assertEquals($expectedResult, $result);
    }

    public function testSupportsNormalization()
    {
        $debate = new Debate();
        $this->assertTrue($this->normalizer->supportsNormalization(new DebateAnonymousArgument($debate), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
        $this->assertFalse($this->normalizer->supportsNormalization(new DebateAnonymousArgument($debate), 'csv'));
        $this->assertFalse($this->normalizer->supportsNormalization(new \stdClass(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
    }

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
