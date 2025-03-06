<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Serializer\ReplyAnonymousParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class QuestionnaireParticipantExporter extends ParticipantExporter
{
    private const BATCH_SIZE = 1000;
    protected EntityManagerInterface $entityManager;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly ParticipantNormalizer $participantNormalizer,
        private readonly ReplyAnonymousParticipantNormalizer $replyAnonymousNormalizer,
        EntityManagerInterface $entityManager,
        private readonly ReplyAnonymousRepository $replyAnonymousRepository,
        Filesystem $fileSystem,
        private readonly ParticipantsFilePathResolver $filePathResolver
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @throws \Exception
     */
    public function exportQuestionnaireParticipants(Questionnaire $questionnaire, ?string $delimiter): void
    {
        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep) {
            return;
        }

        $this->setDelimiter($delimiter);

        $paths['simplified'] = $this->filePathResolver->getSimplifiedExportPath($questionnaire->getStep());
        $paths['full'] = $this->filePathResolver->getFullExportPath($questionnaire->getStep());

        if ($this->shouldExportParticipant($paths, $questionnaire)
            || $this->shouldExportReplyAnonymous(
                $paths,
                $questionnaire
            )) {
            $this->exportParticipantsInBatches($questionnaire, $paths);
            $this->exportReplyAnonymousInBatches($questionnaire, $paths);
        }
    }

    /**
     * @param array<ReplyAnonymous> $anonymousReplies
     * @param array<string, string> $paths
     */
    private function exportAnonymousReplies(
        array $anonymousReplies,
        array $paths,
        bool $withHeaders
    ): void {
        if (!$anonymousReplies) {
            return;
        }
        $this->writeFiles($anonymousReplies, $paths, $withHeaders);
    }

    /**
     * @param array<string, string> $paths
     */
    private function exportParticipantsInBatches(
        Questionnaire $questionnaire,
        array $paths
    ): void {
        $participantOffset = 0;

        do {
            $participants = $this->userRepository->getQuestionnaireParticipants(
                $questionnaire,
                $participantOffset,
                self::BATCH_SIZE
            );

            if ([] === $participants) {
                return;
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
    private function exportReplyAnonymousInBatches(
        Questionnaire $questionnaire,
        array $paths
    ): void {
        $anonymousRepliesOffset = 0;

        do {
            $anonymousReplies = $this->replyAnonymousRepository->getQuestionnaireAnonymousReplies(
                $questionnaire,
                $anonymousRepliesOffset,
                self::BATCH_SIZE,
            );

            if ([] === $anonymousReplies) {
                return;
            }

            $this->exportAnonymousReplies(
                $anonymousReplies,
                $paths,
                0 === $anonymousRepliesOffset && !$this->hasParticipants
            );

            $anonymousRepliesOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($anonymousReplies));
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExportParticipant(array $paths, Questionnaire $questionnaire): bool
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        return $this->userRepository->hasNewParticipantsForAQuestionnaire($questionnaire, $oldestUpdateDate);
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExportReplyAnonymous(array $paths, Questionnaire $questionnaire): bool
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths);

        return $this->replyAnonymousRepository->hasNewAnonymousReplies($questionnaire, $oldestUpdateDate);
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer, $this->replyAnonymousNormalizer],
            [new CsvEncoder()]
        );
    }
}
