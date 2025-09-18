<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class SelectionParticipantExporter extends ParticipantExporter
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
    public function exportSelectionParticipants(
        SelectionStep $selectionStep,
        array $participants,
        ?string $delimiter,
        bool $withHeaders,
        bool $append
    ): void {
        $this->setDelimiter($delimiter);

        $paths[ExportVariantsEnum::SIMPLIFIED->value] = $this->participantsFilePathResolver->getSimplifiedExportPath($selectionStep);
        $paths[ExportVariantsEnum::FULL->value] = $this->participantsFilePathResolver->getFullExportPath($selectionStep);

        $this->setStep($selectionStep);
        $this->exportParticipants($participants, $paths, $withHeaders, $append);
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }
}
