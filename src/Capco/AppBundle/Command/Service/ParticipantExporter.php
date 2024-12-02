<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\SerializerInterface;

class ParticipantExporter
{
    public const CSV_DELIMITER = ';';
    protected bool $hasParticipants = false;
    protected SymfonyStyle $style;
    private ?string $delimiter = self::CSV_DELIMITER;

    public function __construct(protected EntityManagerInterface $entityManager, private readonly SerializerInterface $serializer, private readonly Filesystem $fileSystem)
    {
    }

    public function initializeStyle(SymfonyStyle $style)
    {
        $this->style = $style;
    }

    protected function getOldestUpdateDate(string $simplifiedPath, string $fullPath): \DateTime
    {
        $simplifiedFileDate = filemtime($simplifiedPath);
        $fullFileDate = filemtime($fullPath);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    protected function exportParticipants(array $users, string $simplifiedPath, string $fullPath, bool $withHeaders): void
    {
        if (!$users) {
            return;
        }
        $this->hasParticipants = true;
        $this->writeFiles($users, $simplifiedPath, $fullPath, $withHeaders);
    }

    protected function writeFiles($users, string $simplifiedPath, string $fullPath, bool $withHeaders): void
    {
        $this->write($simplifiedPath, $users, $withHeaders, false);
        $this->write($fullPath, $users, $withHeaders, true);
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    private function write(string $path, array $data, bool $withHeader, bool $isFullExport): void
    {
        $options = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_FULL_EXPORT => $isFullExport,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        $content = $this->serializer->serialize(
            $data,
            CsvEncoder::FORMAT,
            $options
        );

        if ($withHeader) {
            $this->fileSystem->dumpFile($path, $content);

            $this->style->writeln("\n<info>Exported the CSV files : {$path}</info>");
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($data, $content);
    }
}
