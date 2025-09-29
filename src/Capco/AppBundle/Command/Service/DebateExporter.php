<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\SerializerInterface;

class DebateExporter
{
    public const CSV_DELIMITER = ';';
    protected bool $hasDebates = false;
    protected SymfonyStyle $style;
    private string $delimiter = self::CSV_DELIMITER;

    public function __construct(
        protected EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly Filesystem $fileSystem
    ) {
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    /**
     * @param array<string, string> $paths
     */
    protected function getOldestUpdateDate(array $paths): \DateTime
    {
        $simplifiedFileDate = filemtime($paths[ExportVariantsEnum::SIMPLIFIED->value]);
        $fullFileDate = filemtime($paths[ExportVariantsEnum::FULL->value]);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    /**
     * @param array<DebateAnonymousVote|DebateVote> $data
     * @param array<string, string>                 $paths
     */
    protected function exportDebates(array $data, array $paths, bool $withHeaders): void
    {
        if (!$data) {
            return;
        }
        $this->hasDebates = true;
        $this->writeFiles($data, $paths, $withHeaders);
    }

    /**
     * @param array<DebateAnonymousVote|DebateVote> $data
     * @param array<string, string>                 $paths
     */
    protected function writeFiles(array $data, array $paths, bool $withHeaders): void
    {
        $this->write($paths[ExportVariantsEnum::SIMPLIFIED->value], $data, $withHeaders, ExportVariantsEnum::SIMPLIFIED);
        $this->write($paths[ExportVariantsEnum::FULL->value], $data, $withHeaders, ExportVariantsEnum::FULL);
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    /**
     * @param array<DebateAnonymousVote|DebateVote> $data
     */
    private function write(string $path, array $data, bool $withHeader, ExportVariantsEnum $variant): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::EXPORT_VARIANT => $variant,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        $content = $this->serializer->serialize(
            $data,
            CsvEncoder::FORMAT,
            $context
        );

        if ($withHeader) {
            $this->fileSystem->dumpFile($path, $content);

            $this->style->writeln("\n<info>Exported the CSV files : {$path}</info>");
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }
}
