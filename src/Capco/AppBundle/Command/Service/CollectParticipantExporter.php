<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class CollectParticipantExporter extends ParticipantExporter
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
    public function exportCollectParticipants(CollectStep $collectStep, array $participants, ?string $delimiter, bool $withHeaders, bool $append, OutputInterface $output): void
    {
        $this->setDelimiter($delimiter);

        $paths['simplified'] = $this->participantsFilePathResolver->getSimplifiedExportPath($collectStep);
        $paths['full'] = $this->participantsFilePathResolver->getFullExportPath($collectStep);

        if ($this->shouldExportParticipant($collectStep, $paths, $append)) {
            $this->setStep($collectStep);
            $this->exportParticipants($participants, $paths, $withHeaders, $append);
        }
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExportParticipant(CollectStep $collectStep, array $paths, bool $append): bool
    {
        if ($append || !file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            return $this->userRepository->hasNewParticipantsForACollectStep($collectStep, $oldestUpdateDate);
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
