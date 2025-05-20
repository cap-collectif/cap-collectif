<?php

namespace Capco\Tests\Router;

use Capco\AppBundle\Exception\UnserializableException;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class DefaultPatternGenerationStrategyTest extends TestCase
{
    private string $cacheDir;

    protected function setUp(): void
    {
        $this->cacheDir = sys_get_temp_dir() . '/router_test_cache';

        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0770, true);
        }
    }

    protected function tearDown(): void
    {
        $this->deleteRecursive($this->cacheDir);
    }

    /**
     * @covers \DefaultPatternGenerationStrategy::addResources()
     */
    public function testUnserializeMaliciousContent(): void
    {
        $this->expectExceptionMessage('Given content is not unserializable.');
        $this->expectException(UnserializableException::class);

        $locales = ['fr'];

        $maliciousContent = 'Qzo2NzoiU3ltZm9ueVxDb21wb25lbnRcU2VjdXJpdHlcQ29yZVxBdXRoZW50aWNhdGlvblxUb2tlblxBbm9ueW1vdXNUb2tlbiI6NTM2OnthOjI6e2k6MDtOO2k6MTtPOjUxOiJTeW1mb255XENvbXBvbmVudFxWYWxpZGF0b3JcQ29uc3RyYWludFZpb2xhdGlvbkxpc3QiOjE6e3M6NjM6IgBTeW1mb255XENvbXBvbmVudFxWYWxpZGF0b3JcQ29uc3RyYWludFZpb2xhdGlvbkxpc3QAdmlvbGF0aW9ucyI7Tzo1MDoiU3ltZm9ueVxDb21wb25lbnRcRmluZGVyXEl0ZXJhdG9yXFNvcnRhYmxlSXRlcmF0b3IiOjI6e3M6NjA6IgBTeW1mb255XENvbXBvbmVudFxGaW5kZXJcSXRlcmF0b3JcU29ydGFibGVJdGVyYXRvcgBpdGVyYXRvciI7Tzo1MToiU3ltZm9ueVxDb21wb25lbnRcVmFsaWRhdG9yXENvbnN0cmFpbnRWaW9sYXRpb25MaXN0IjoxOntzOjYzOiIAU3ltZm9ueVxDb21wb25lbnRcVmFsaWRhdG9yXENvbnN0cmFpbnRWaW9sYXRpb25MaXN0AHZpb2xhdGlvbnMiO2E6Mjp7aTowO3M6NzoicGhwaW5mbyI7aToxO3M6MToiMSI7fX1zOjU2OiIAU3ltZm9ueVxDb21wb25lbnRcRmluZGVyXEl0ZXJhdG9yXFNvcnRhYmxlSXRlcmF0b3IAc29ydCI7czoxNDoiY2FsbF91c2VyX2Z1bmMiO319fX0=';

        foreach ($locales as $locale) {
            $metaFile = $this->cacheDir . "/translations/catalogue.{$locale}.php.meta";
            $dir = \dirname($metaFile);
            if (!is_dir($dir)) {
                mkdir($dir, 0770, true);
            }
            file_put_contents($metaFile, base64_decode($maliciousContent));
        }

        $translator = $this->createMock(TranslatorInterface::class);

        $routeCollection = $this->createMock(RouteCollection::class);

        $strategy = new DefaultPatternGenerationStrategy(
            DefaultPatternGenerationStrategy::STRATEGY_PREFIX,
            $translator,
            $locales,
            $this->cacheDir
        );
        $strategy->addResources($routeCollection);
    }

    private function deleteRecursive(string $directory): void
    {
        foreach (glob($directory . '/*') as $item) {
            if (is_dir($item)) {
                $this->deleteRecursive($item);
            } else {
                unlink($item);
            }
        }
        rmdir($directory);
    }
}
