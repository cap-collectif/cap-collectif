<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Command\Service\FilePathResolver\FilePathResolverInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Psr\Cache\InvalidArgumentException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Contracts\Cache\CacheInterface;

class ExportRegenerationService
{
    public function __construct(
        private readonly CacheInterface $exportRedisCachePool,
        private readonly string $exportDirectory
    ) {
    }

    /**
     * @param array<int, ExportableContributionInterface|string> $rows
     *
     * @throws InvalidArgumentException
     */
    public function regenerateCsvIfCachedRowsCountMismatch(
        array $rows,
        AbstractStep $step,
        string $cacheKeySuffix,
        FilePathResolverInterface $filePathResolver
    ): void {
        $projectIdentifier = $step->getProject()?->getSlug() ?? $step->getProject()?->getId();
        $totalItems = \count($rows);
        $cacheKey = sprintf('%s_%s-%s', $projectIdentifier, $step->getSlug(), $cacheKeySuffix);

        $cacheItem = $this->exportRedisCachePool->getItem($cacheKey);
        $cachedCount = $cacheItem->get() ?? 0;

        if ($totalItems !== $cachedCount) {
            $cacheItem->set($totalItems);
            $this->exportRedisCachePool->save($cacheItem);

            $finder = new Finder();
            $filesystem = new Filesystem();

            $filename = $filePathResolver->getFileName($step);
            $baseName = str_replace('.csv', '', $filename);
            $pattern = sprintf('/^%s(_simplified)?\.csv$/', preg_quote($baseName, '/'));

            $finder
                ->files()
                ->in($this->exportDirectory . '/' . $step->getType())
                ->name($pattern)
            ;

            foreach ($finder as $file) {
                $filesystem->remove($file->getRealPath());
            }
        }
    }
}
