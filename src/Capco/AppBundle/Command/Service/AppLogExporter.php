<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\AppLogNormalizer;
use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\AppLogFilePathResolver;
use Capco\AppBundle\Entity\AppLog;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Repository\AppLogRepository;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class AppLogExporter
{
    final public const CSV_DELIMITER = ';';
    final public const BATCH_SIZE = 10000;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private readonly Filesystem $fileSystem,
        private readonly AppLogFilePathResolver $appLogFilePathResolver,
        private readonly AppLogNormalizer $appLogNormalizer,
        private readonly AppLogRepository $appLogRepository,
        private readonly LocaleRepository $localeRepository,
        private readonly LoggerInterface $logger
    ) {
        $this->serializer = $this->initializeSerializer();
    }

    /**
     * @throws LocaleConfigurationException
     */
    public function exportLogs(string $delimiter, SymfonyStyle $style): void
    {
        $path = $this->appLogFilePathResolver->getExportPath();

        $this->shouldExport($path)
            ? $this->exportAppLogByBatch($path, $delimiter, $style)
            : $style->note('No new logs to export');
    }

    private function initializeSerializer(): SerializerInterface
    {
        return new Serializer(
            [
                $this->appLogNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @param AppLog[] $logs
     */
    private function write(array $logs, bool $withHeader, string $path, string $delimiter): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
            'is_full_export' => true,
        ];

        $content = $this->serializer->serialize(
            $logs,
            CsvEncoder::FORMAT,
            $context
        );

        if ($withHeader) {
            $this->fileSystem->dumpFile($path, $content);
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }

    private function shouldExport(string $path): bool
    {
        if (!file_exists($path)) {
            return true;
        }

        $oldestCreateDate = $this->getOldestCreateDate($path);

        try {
            return $this->appLogRepository->hasNewLogs($oldestCreateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function getOldestCreateDate(string $path): \DateTime
    {
        $fileDate = filemtime($path);

        return (new \DateTime())->setTimestamp($fileDate);
    }

    /**
     * @throws LocaleConfigurationException
     */
    private function exportAppLogByBatch(string $path, string $delimiter, SymfonyStyle $style): void
    {
        $offset = 0;
        $countLogs = 0;
        $withHeaders = true;
        do {
            $logs = $this->appLogRepository->findAllLogsPaginated($this->localeRepository->getDefaultCode(), $offset, self::BATCH_SIZE);

            if ([] === $logs) {
                continue;
            }

            $this->write($logs, $withHeaders, $path, $delimiter);
            $withHeaders = false;
            $this->entityManager->clear();
            $offset += self::BATCH_SIZE;
            $countLogs += \count($logs);
        } while (\count($logs) > 0);

        $style->writeln(sprintf('%d logs has been exported', $countLogs));
    }
}
