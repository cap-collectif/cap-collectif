<?php

namespace Capco\Tests\Normalizer;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\GraphQL\Resolver\User\UserRolesTextResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class ParticipantNormalizerTest extends TestCase
{
    private ParticipantNormalizer $participantNormalizer;

    protected function setUp(): void
    {
        parent::setUp();

        $translator = $this->createMock(TranslatorInterface::class);
        $userRolesTextResolver = $this->createMock(UserRolesTextResolver::class);
        $userUrlResolver = $this->createMock(UserUrlResolver::class);

        $this->participantNormalizer = new ParticipantNormalizer($userRolesTextResolver, $userUrlResolver, $translator);

        $translator->method('trans')
            ->willReturnCallback(fn ($key) => $key)
        ;
    }

    /**
     * @dataProvider normalizationDataProvider
     *
     * @param array<string, bool>        $context
     * @param array<string, null|string> $expectedResult
     *
     * @throws ExceptionInterface
     */
    public function testNormalize(array $context, array $expectedResult): void
    {
        $user = new User();
        $userIdentificationCode = new UserIdentificationCode();
        $userIdentificationCode->setIdentificationCode('abcdef');

        $expectedEmail = 'amelie.lecoz00@gmail.com';
        $user->setId(1);
        $user->setUsername('amelie.lecoz');
        $user->setEmail($expectedEmail);
        $user->setConsentInternalCommunication(true);
        $user->setPhone('0987654321');
        $user->setFirstName('Amélie');
        $user->setLastName('Le Coz');
        $user->setDateOfBirth(new \DateTime('1990-11-30'));
        $user->setZipCode('75000');
        $user->setCity('Paris');
        $user->setUserIdentificationCode($userIdentificationCode);
        $user->setGender('f');
        $user->setEnabled(true);
        $user->setCreatedAt(new \DateTime('2021-01-01'));

        $result = $this->participantNormalizer->normalize($user, null, $context);

        $this->assertIsArray($result);
        $this->assertEquals($result, $expectedResult);
    }

    public function testSupportsNormalization(): void
    {
        $this->assertTrue($this->participantNormalizer->supportsNormalization(new User(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
        $this->assertFalse($this->participantNormalizer->supportsNormalization(new User(), 'csv'));
        $this->assertFalse($this->participantNormalizer->supportsNormalization(new \stdClass(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
    }

    /**
     * @return array<string, array<int, array<string, null|bool|string>>>
     */
    public function normalizationDataProvider(): array
    {
        $simplifiedExportResult = [
            'export_participant_user_id' => '1',
            'export_participant_username' => 'amelie.lecoz',
            'export_participant_user_email' => 'amelie.lecoz00@gmail.com',
            'export_participant_consent_internal_communication' => 'Oui',
            'export_participant_phone' => '0987654321',
            'export_participant_type' => null,
            'export_participant_firstname' => 'Amélie',
            'export_participant_lastname' => 'Le Coz',
            'export_participant_date_of_birth' => '1990-11-30 00:00:00',
            'export_participant_postal_address' => null,
            'export_participant_zip_code' => '75000',
            'export_participant_city' => 'Paris',
            'export_participant_profile_url' => '',
            'export_participant_identification_code' => 'abcdef',
        ];

        $fullExportResult = $simplifiedExportResult + [
            'export_participant_user_created_at' => '2021-01-01 00:00:00',
            'export_participant_user_updated_at' => null,
            'export_participant_user_last_login' => null,
            'export_participant_user_roles_text' => '',
            'export_participant_user_enabled' => 'Oui',
            'export_participant_user_is_email_confirmed' => 'Oui',
            'export_participant_user_locked' => 'Non',
            'export_participant_user_is_phone_confirmed' => 'Non',
            'export_participant_gender' => 'f',
            'export_participant_website_url' => null,
            'export_participant_biography' => null,
            'export_participant_is_france_connect_associated' => 'Non',
        ];

        return [
            'Partial Export' => [['is_full_export' => false, BaseNormalizer::IS_EXPORT_NORMALIZER => true], $simplifiedExportResult],
            'Full Export' => [['is_full_export' => true, BaseNormalizer::IS_EXPORT_NORMALIZER => true], $fullExportResult],
        ];
    }
}
