<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\UserBundle\Entity\User;
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
    protected ?string $delimiter = self::CSV_DELIMITER;
    protected ?AbstractStep $step = null;

    public function __construct(
        protected EntityManagerInterface $entityManager,
        protected SerializerInterface $serializer,
        protected readonly Filesystem $fileSystem
    ) {
    }

    public function initializeStyle(SymfonyStyle $style): void
    {
        $this->style = $style;
    }

    public function setStep(AbstractStep $step): void
    {
        $this->step = $step;
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
     * @param array<ExportableContributionInterface|Participant|Reply|User> $participants
     * @param array<string, string>                                         $paths
     */
    protected function exportParticipants(array $participants, array $paths, bool $withHeaders, bool $append = false): void
    {
        if (!$participants) {
            return;
        }
        $this->hasParticipants = true;
        $this->writeFiles($participants, $paths, $withHeaders);
    }

    /**
     * @param array<ExportableContributionInterface|Participant|Reply|User> $participants
     * @param array<string, string>                                         $paths
     */
    protected function writeFiles(array $participants, array $paths, bool $withHeaders, bool $append = false): void
    {
        $this->write($paths[ExportVariantsEnum::SIMPLIFIED->value], $participants, $withHeaders, ExportVariantsEnum::SIMPLIFIED, $append);
        $this->write($paths[ExportVariantsEnum::FULL->value], $participants, $withHeaders, ExportVariantsEnum::FULL, $append);
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    protected function write(string $path, array $data, bool $withHeader, ExportVariantsEnum $variant, bool $append): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::EXPORT_VARIANT => $variant,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        if (null !== $this->step) {
            $context['step'] = $this->step;
        }

        $content = $this->serializer->serialize(
            $data,
            CsvEncoder::FORMAT,
            $context
        );

        if ($withHeader && !$append) {
            $this->fileSystem->dumpFile($path, $content);

            $this->style->writeln("\n<info>Exported the CSV files : {$path}</info>");
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }
}
