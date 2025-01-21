<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Command\Service\FilePathResolver\AbstractFilePathResolver;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\SerializerInterface;

class ContributionExporter
{
    final public const CSV_DELIMITER = ';';
    protected SymfonyStyle $style;
    /**
     * @var array<string, null|bool|string>
     */
    protected array $context;
    protected ?string $delimiter = self::CSV_DELIMITER;

    public function __construct(
        protected EntityManagerInterface $entityManager,
        protected SerializerInterface $serializer,
        private readonly Filesystem $fileSystem,
        private readonly AbstractFilePathResolver $filePathResolverContributions
    ) {
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    /**
     * @param array<ExportableContributionInterface> $opinionContributions
     */
    protected function exportContributions(array $opinionContributions, AbstractStep $step, bool $withHeaders, bool $append = false): void
    {
        $this->writeFiles($opinionContributions, $step, $withHeaders, $append);
    }

    /**
     * @param array<ExportableContributionInterface> $contributions
     */
    protected function writeFiles(array $contributions, AbstractStep $step, bool $withHeaders, bool $append = false): void
    {
        $this->write($step, $contributions, $withHeaders, false, $append);
        $this->write($step, $contributions, $withHeaders, true, $append);
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    /**
     * @param array<ExportableContributionInterface> $contributions
     */
    private function write(AbstractStep $step, array $contributions, bool $withHeader, bool $isFullExport, bool $append): void
    {
        $path = $isFullExport
            ? $this->filePathResolverContributions->getFullExportPath($step)
            : $this->filePathResolverContributions->getSimplifiedExportPath($step);

        $this->context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_FULL_EXPORT => $isFullExport,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        if ([] === $contributions) {
            return;
        }

        $content = $this->serializer->serialize(
            $contributions,
            CsvEncoder::FORMAT,
            $this->context
        );

        if ($withHeader && !$append) {
            $this->fileSystem->dumpFile($path, $content);
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }
}
