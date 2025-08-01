<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class SelectionParticipantExporter extends ParticipantExporter
{
    protected EntityManagerInterface $entityManager;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ParticipantNormalizer $participantNormalizer,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver,
        private readonly LoggerInterface $logger
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @param array<User> $participants
     */
    public function exportSelectionParticipants(
        SelectionStep $selectionStep,
        array $participants,
        ?string $delimiter,
        bool $withHeaders,
        bool $append
    ): void {
        $this->setDelimiter($delimiter);

        $paths['simplified'] = $this->participantsFilePathResolver->getSimplifiedExportPath($selectionStep);
        $paths['full'] = $this->participantsFilePathResolver->getFullExportPath($selectionStep);

        if ($this->shouldExportParticipant($selectionStep, $participants, $paths, $append)) {
            $this->setStep($selectionStep);
            $this->exportParticipants($participants, $paths, $withHeaders, $append);
        }
    }

    /**
     * @param array<string, string> $paths
     * @param array<User>           $participants
     */
    private function shouldExportParticipant(SelectionStep $selectionStep, array $participants, array $paths, bool $append): bool
    {
        if ($append || !file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            return $this->userRepository->hasNewParticipantsForASelectionStep($selectionStep, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }
}
