<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class ConsultationParticipantExporter extends ParticipantExporter
{
    public const BATCH_SIZE = 1000;

    public function __construct(
        private readonly UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantNormalizer $participantNormalizer,
        private readonly LoggerInterface $logger
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @param array<int, string>    $participantsIds
     * @param array<string, string> $paths
     */
    public function exportConsultationParticipants(
        array $participantsIds,
        array $paths,
        ?string $delimiter = null
    ): void {
        $this->setDelimiter($delimiter);

        if ($this->shouldExport($paths, $participantsIds)) {
            $participants = $this->userRepository->findBy(['id' => $participantsIds]);
            $this->exportParticipantsInBatches($participants, $paths);
        }
    }

    private function initializeSerializer(): SerializerInterface
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }

    /**
     * @param User[]                $participants
     * @param array<string, string> $paths
     */
    private function exportParticipantsInBatches(
        array $participants,
        array $paths
    ): void {
        $withHeader = true;

        foreach (array_chunk($participants, self::BATCH_SIZE) as $participantsChunk) {
            $this->exportParticipants(
                $participantsChunk,
                $paths,
                $withHeader
            );
            $withHeader = false;
        }
    }

    /**
     * @param array<string, string> $paths
     * @param array<int, string>    $participantsIds
     */
    private function shouldExport(array $paths, array $participantsIds): bool
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            return $this->userRepository->hasNewParticipantsForAConsultation($participantsIds, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }
}
