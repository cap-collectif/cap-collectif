<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\VoteNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\VotesFilePathResolver;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class DebateVoteExporter extends DebateExporter
{
    private const BATCH_SIZE = 1000;

    public function __construct(
        private readonly VotesFilePathResolver $voteFilePathResolver,
        private readonly DebateVoteRepository $debateVoteRepository,
        private readonly LoggerInterface $logger,
        protected EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly VoteNormalizer $voteNormalizer
    ) {
        $serializer = $this->initializeSerializer();
        parent::__construct($this->entityManager, $serializer, $fileSystem);
    }

    public function exportDebateVotes(Debate $debate, DebateStep $debateStep, ?string $delimiter = null): void
    {
        $this->setDelimiter($delimiter);

        $paths['simplified'] = $this->voteFilePathResolver->getSimplifiedExportPath($debateStep);
        $paths['full'] = $this->voteFilePathResolver->getFullExportPath($debateStep);

        if ($this->shouldExportDebate($paths, $debate)) {
            $this->exportVotesInBatches($debate, $paths);
        }
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->voteNormalizer],
            [new CsvEncoder()]
        );
    }

    /**
     * @param array<string, string> $paths
     *
     * @return bool|int
     */
    private function shouldExportDebate(array $paths, Debate $debate)
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        try {
            return $this->debateVoteRepository->hasNewVotes($debate, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    /**
     * @param array<string, string> $paths
     */
    private function exportVotesInBatches(Debate $debate, array $paths): void
    {
        $voteOffset = 0;

        do {
            $votes = $this->debateVoteRepository->getDebateVotes(
                $debate,
                $voteOffset,
                self::BATCH_SIZE
            );

            if (empty($votes)) {
                break;
            }

            $this->exportDebates(
                $votes,
                $paths,
                0 === $voteOffset
            );

            $voteOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($votes));
    }
}
