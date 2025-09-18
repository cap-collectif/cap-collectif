<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class CollectParticipantExporter extends ParticipantExporter
{
    protected EntityManagerInterface $entityManager;

    public function __construct(
        private readonly ParticipantNormalizer $participantNormalizer,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver,
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @param array< Participant|User > $participants
     */
    public function exportCollectParticipants(CollectStep $collectStep, array $participants, ?string $delimiter, bool $withHeaders, bool $append, OutputInterface $output): void
    {
        $this->setDelimiter($delimiter);

        $paths[ExportVariantsEnum::SIMPLIFIED->value] = $this->participantsFilePathResolver->getSimplifiedExportPath($collectStep);
        $paths[ExportVariantsEnum::FULL->value] = $this->participantsFilePathResolver->getFullExportPath($collectStep);

        $this->setStep($collectStep);
        $this->exportParticipants($participants, $paths, $withHeaders, $append);
    }

    /**
     * @param array< Participant|User > $data
     */
    protected function write(string $path, array $data, bool $withHeader, ExportVariantsEnum $variant, bool $append): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::EXPORT_VARIANT => $variant,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
        ];

        $isFullExport = ExportVariantsEnum::isFull($variant);

        if (!$isFullExport) {
            $data = array_filter($data, function (User|Participant $participant) {
                foreach ($participant->getVotes() as $vote) {
                    $step = $vote->getStep();

                    if ('collect' === $step?->getType()
                        && true === $vote->getIsAccounted()
                        && $step->getSlug() === $this->step->getSlug()) {
                        return true;
                    }
                }

                $proposals = $this->step->getProposalForm()?->getProposals();

                if ($proposals) {
                    return $participant->getProposals()->exists(
                        fn ($key, $proposal) => $proposals->contains($proposal)
                    );
                }

                return false;
            });

            $data = array_values($data);
        }

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

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }
}
