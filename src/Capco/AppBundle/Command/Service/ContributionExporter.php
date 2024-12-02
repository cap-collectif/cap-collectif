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
    private ?string $delimiter = self::CSV_DELIMITER;

    public function __construct(protected EntityManagerInterface $entityManager, protected SerializerInterface $serializer, private readonly Filesystem $fileSystem, private readonly AbstractFilePathResolver $filePathResolverContributions)
    {
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    /**
     * @param array<ExportableContributionInterface> $contributions
     */
    protected function exportContributions(array $contributions, AbstractStep $step, bool $withHeaders): void
    {
        $this->writeFiles($contributions, $step, $withHeaders);
    }

    /**
     * @param array<ExportableContributionInterface> $contributions
     */
    protected function writeFiles(array $contributions, AbstractStep $step, bool $withHeaders): void
    {
        $this->write($step, $contributions, $withHeaders, false);
        $this->write($step, $contributions, $withHeaders, true);
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
    private function write(AbstractStep $step, array $contributions, bool $withHeader, bool $isFullExport): void
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

        $content = $this->serializer->serialize(
            $contributions,
            CsvEncoder::FORMAT,
            $this->context
        );

        if ($withHeader) {
            $this->fileSystem->dumpFile($path, $content);
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($contributions, $content);
    }
}
