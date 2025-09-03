<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\DebateAnonymousArgumentNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
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
    final public const BATCH_SIZE = 1000;

    public function __construct(
        private readonly DebateAnonymousArgumentRepository $debateAnonymousArgumentRepository,
        private readonly DebateArgumentRepository $debateArgumentRepository,
        private readonly DebateVoteRepository $debateVoteRepository,
        private readonly UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantNormalizer $participantNormalizer,
        private readonly DebateAnonymousArgumentNormalizer $debateAnonymousArgumentNormalizer,
        private readonly LoggerInterface $logger,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    public function exportDebateParticipants(DebateStep $debateStep, ?string $delimiter = null): void
    {
        $this->setDelimiter($delimiter);

        $paths[ExportVariantsEnum::SIMPLIFIED->value] = $this->participantsFilePathResolver->getSimplifiedExportPath($debateStep);
        $paths[ExportVariantsEnum::FULL->value] = $this->participantsFilePathResolver->getFullExportPath($debateStep);

        /** @var Debate $debate */
        $debate = $debateStep->getDebate();

        if ($this->shouldExport($paths, $debate)) {
            $this->exportParticipantsInBatches($debate, $paths);
            $this->exportAnonymousArgumentsInBatches($debate, $paths);
        }
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer, $this->debateAnonymousArgumentNormalizer],
            [new CsvEncoder()]
        );
    }

    /**
     * @param array<string, string> $paths
     */
    private function exportParticipantsInBatches(
        Debate $debate,
        array $paths
    ): void {
        $participantOffset = 0;

        do {
            $participants = $this->userRepository->getDebateParticipantsCombined(
                $debate,
                $participantOffset,
                self::BATCH_SIZE
            );

            if (empty($participants)) {
                break;
            }

            $this->exportParticipants(
                $participants,
                $paths,
                0 === $participantOffset
            );

            $participantOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($participants));
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExport(array $paths, Debate $debate): bool
    {
        if (!file_exists($paths[ExportVariantsEnum::SIMPLIFIED->value]) || !file_exists($paths[ExportVariantsEnum::FULL->value])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            return $this->debateArgumentRepository->hasNewArguments($debate, $oldestUpdateDate)
                || $this->debateVoteRepository->hasNewVotes($debate, $oldestUpdateDate)
                || $this->userRepository->hasNewParticipantsForADebate($debate, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    /**
     * @param array<string, string> $paths
     */
    private function exportAnonymousArgumentsInBatches(Debate $debate, array $paths): void
    {
        $anonymousArgumentsOffset = 0;

        do {
            $anonymousArguments = $this->debateAnonymousArgumentRepository->getDebateAnonymousArguments(
                $debate,
                $anonymousArgumentsOffset,
                self::BATCH_SIZE
            );

            if (empty($anonymousArguments)) {
                break;
            }

            $this->exportAnonymousArguments(
                $anonymousArguments,
                $paths,
                0 === $anonymousArgumentsOffset && !$this->hasParticipants
            );

            $anonymousArgumentsOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($anonymousArguments));
    }

    /**
     * @param array<DebateAnonymousArgument> $anonymousArguments
     * @param array<string, string>          $paths
     */
    private function exportAnonymousArguments(
        array $anonymousArguments,
        array $paths,
        bool $withHeaders
    ): void {
        if (!$anonymousArguments) {
            return;
        }

        $this->writeFiles($anonymousArguments, $paths, $withHeaders);
    }
}
