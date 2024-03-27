<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\DebateAnonymousArgumentNormalizer;
use Capco\AppBundle\Command\Serializer\UserNormalizer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class DebateParticipantExporter extends ParticipantExporter
{
    public const BATCH_SIZE = 1000;
    private DebateArgumentRepository $debateArgumentRepository;
    private DebateAnonymousArgumentRepository $debateAnonymousArgumentRepository;
    private UserRepository $userRepository;
    private UserNormalizer $userNormalizer;
    private Serializer $serializer;
    private DebateAnonymousArgumentNormalizer $debateAnonymousArgumentNormalizer;
    private DebateVoteRepository $debateVoteRepository;
    private LoggerInterface $logger;
    private FilePathResolver $filePathResolver;

    public function __construct(
        DebateAnonymousArgumentRepository $debateAnonymousArgumentRepository,
        DebateArgumentRepository $debateArgumentRepository,
        DebateVoteRepository $debateVoteRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        UserNormalizer $userNormalizer,
        DebateAnonymousArgumentNormalizer $debateAnonymousArgumentNormalizer,
        LoggerInterface $logger,
        FilePathResolver $filePathResolver
    ) {
        $this->debateAnonymousArgumentRepository = $debateAnonymousArgumentRepository;
        $this->debateArgumentRepository = $debateArgumentRepository;
        $this->debateVoteRepository = $debateVoteRepository;
        $this->userRepository = $userRepository;
        $this->userNormalizer = $userNormalizer;
        $this->debateAnonymousArgumentNormalizer = $debateAnonymousArgumentNormalizer;
        $this->logger = $logger;
        $this->filePathResolver = $filePathResolver;

        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    public function exportDebateParticipants(Debate $debate, ?string $delimiter = null): void
    {
        $this->setDelimiter($delimiter);

        $simplifiedPath = $this->filePathResolver->getSimplifiedExportPath($debate->getStep());
        $fullPath = $this->filePathResolver->getFullExportPath($debate->getStep());

        if ($this->shouldExport($simplifiedPath, $fullPath, $debate)) {
            $this->exportParticipantsInBatches($debate, $simplifiedPath, $fullPath);
            $this->exportAnonymousArgumentsInBatches($debate, $simplifiedPath, $fullPath);
        }
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->userNormalizer, $this->debateAnonymousArgumentNormalizer],
            [new CsvEncoder()]
        );
    }

    private function exportParticipantsInBatches(
        Debate $debate,
        string $simplifiedPath,
        string $fullPath
    ): void {
        $participantOffset = 0;

        do {
            $participants = $this->userRepository->getDebateParticipantsCombined(
                $debate,
                $participantOffset,
                self::BATCH_SIZE
            );

            $this->exportParticipants(
                $participants,
                $simplifiedPath,
                $fullPath,
                0 === $participantOffset
            );

            $participantOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($participants));
    }

    private function shouldExport(string $simplifiedPath, string $fullPath, Debate $debate): bool
    {
        if (!file_exists($simplifiedPath) || !file_exists($fullPath)) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($simplifiedPath, $fullPath);

        try {
            return $this->debateArgumentRepository->hasNewArguments($debate, $oldestUpdateDate)
                || $this->debateVoteRepository->hasNewVotes($debate, $oldestUpdateDate)
                || $this->userRepository->hasNewParticipantsForADebate($debate, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function exportAnonymousArgumentsInBatches(Debate $debate, string $simplifiedPath, string $fullPath): void
    {
        $anonymousArgumentsOffset = 0;

        do {
            $anonymousArguments = $this->debateAnonymousArgumentRepository->getDebateAnonymousArguments(
                $debate,
                $anonymousArgumentsOffset,
                self::BATCH_SIZE
            );

            $this->exportAnonymousArguments(
                $anonymousArguments,
                $simplifiedPath,
                $fullPath,
                0 === $anonymousArgumentsOffset && !$this->hasParticipants
            );

            $anonymousArgumentsOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($anonymousArguments));
    }

    /**
     * @param array<DebateAnonymousArgument> $anonymousArguments
     */
    private function exportAnonymousArguments(
        array $anonymousArguments,
        string $simplifiedPath,
        string $fullPath,
        bool $withHeaders
    ): void {
        if (!$anonymousArguments) {
            return;
        }

        $this->writeFiles($anonymousArguments, $simplifiedPath, $fullPath, $withHeaders);
    }
}
