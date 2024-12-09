<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Entity\Debate\DebateVote;
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

    public function __construct(protected EntityManagerInterface $entityManager, private readonly SerializerInterface $serializer, private readonly Filesystem $fileSystem)
    {
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
        $simplifiedFileDate = filemtime($paths['simplified']);
        $fullFileDate = filemtime($paths['full']);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    /**
     * @param array<DebateVote>     $data
     * @param array<string, string> $paths
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
     * @param array<DebateVote>     $data
     * @param array<string, string> $paths
     */
    protected function writeFiles(array $data, array $paths, bool $withHeaders): void
    {
        $this->write($paths['simplified'], $data, $withHeaders, false);
        $this->write($paths['full'], $data, $withHeaders, true);
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    /**
     * @param array<DebateVote> $data
     */
    private function write(string $path, array $data, bool $withHeader, bool $isFullExport): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_FULL_EXPORT => $isFullExport,
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
