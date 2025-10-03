<?php

namespace Capco\Tests\Normalizer;

use Capco\AppBundle\Command\Serializer\AppLogNormalizer;
use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Entity\AppLog;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class AppLogNormalizerTest extends TestCase
{
    private AppLogNormalizer $logAdminNormalizer;

    protected function setUp(): void
    {
        parent::setUp();

        $translator = $this->createMock(TranslatorInterface::class);

        $this->logAdminNormalizer = new AppLogNormalizer($translator);

        $translator->method('trans')
            ->willReturnCallback(fn ($key) => $key)
        ;
    }

    /**
     * @dataProvider normalizationDataProvider
     *
     * @param array<string, bool>        $context
     * @param array<string, null|string> $expectedResult
     */
    public function testNormalize(array $context, array $expectedResult): void
    {
        $user = new User();
        $user->setId(1);
        $user->setEmail('test@test.com');
        $user->setUsername('test');

        $log = new AppLog();
        $log->setCreatedAt(new \DateTime('1990-11-30'));
        $log->setDescription('Une description');
        $log->setActionType('SHOW');
        $log->setIp('127.0.0.1');
        $log->setEntityId(1);
        $log->setEntityType(Project::class);
        $log->setUser($user);

        $result = $this->logAdminNormalizer->normalize($log, null, $context);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSupportsNormalization(): void
    {
        $this->assertTrue($this->logAdminNormalizer->supportsNormalization(new AppLog(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
        $this->assertFalse($this->logAdminNormalizer->supportsNormalization(new AppLog(), 'csv'));
        $this->assertFalse($this->logAdminNormalizer->supportsNormalization(new \stdClass(), 'csv', [BaseNormalizer::IS_EXPORT_NORMALIZER => true]));
    }

    /**
     * @return array<string, array<int, array<string, null|bool|string>>>
     */
    public function normalizationDataProvider(): array
    {
        $fullExportResult = [
            'export_app_log_created_at' => '1990-11-30 00:00:00',
            'export_app_log_description' => 'Une description',
            'export_app_log_ip' => '127.0.0.1',
            'export_app_log_user_email' => 'test@test.com',
            'export_app_log_user_username' => 'test',
            'export_app_log_action_type' => 'export_app_log_show_action_type',
        ];

        return [
            'Full Export' => [['is_full_export' => true, BaseNormalizer::IS_EXPORT_NORMALIZER => true], $fullExportResult],
        ];
    }
}
