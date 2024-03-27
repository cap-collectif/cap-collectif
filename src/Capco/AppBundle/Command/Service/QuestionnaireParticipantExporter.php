<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ReplyAnonymousNormalizer;
use Capco\AppBundle\Command\Serializer\UserNormalizer;
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
    private UserRepository $userRepository;
    private ReplyAnonymousRepository $replyAnonymousRepository;
    private UserNormalizer $userNormalizer;
    private ReplyAnonymousNormalizer $replyAnonymousNormalizer;
    private Serializer $serializer;
    private FilePathResolver $filePathResolver;

    public function __construct(
        UserRepository $userRepository,
        UserNormalizer $userNormalizer,
        ReplyAnonymousNormalizer $replyAnonymousNormalizer,
        EntityManagerInterface $entityManager,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Filesystem $fileSystem,
        FilePathResolver $filePathResolver
    ) {
        $this->userRepository = $userRepository;
        $this->userNormalizer = $userNormalizer;
        $this->replyAnonymousNormalizer = $replyAnonymousNormalizer;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
        $this->filePathResolver = $filePathResolver;
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem);
    }

    /**
     * @throws \Exception
     */
    public function exportQuestionnaireParticipants(Questionnaire $questionnaire, ?string $delimiter): void
    {
        if (!$questionnaire->getStep()) {
            return;
        }

        $this->setDelimiter($delimiter);

        $simplifiedPath = $this->filePathResolver->getSimplifiedExportPath($questionnaire->getStep());
        $fullPath = $this->filePathResolver->getFullExportPath($questionnaire->getStep());

        if ($this->shouldExportParticipant($simplifiedPath, $fullPath, $questionnaire)
            || $this->shouldExportReplyAnonymous(
                $simplifiedPath,
                $fullPath,
                $questionnaire
            )) {
            $this->exportParticipantsInBatches($questionnaire, $simplifiedPath, $fullPath);
            $this->exportReplyAnonymousInBatches($questionnaire, $simplifiedPath, $fullPath);
        }
    }

    /**
     * @param array<ReplyAnonymous> $anonymousReplies
     */
    private function exportAnonymousReplies(
        array $anonymousReplies,
        string $simplifiedPath,
        string $fullPath,
        bool $withHeaders
    ): void {
        if (!$anonymousReplies) {
            return;
        }
        $this->writeFiles($anonymousReplies, $simplifiedPath, $fullPath, $withHeaders);
    }

    private function exportParticipantsInBatches(
        Questionnaire $questionnaire,
        string $simplifiedPath,
        string $fullPath
    ): void {
        $participantOffset = 0;

        do {
            $participants = $this->userRepository->getQuestionnaireParticipants(
                $questionnaire,
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

    private function exportReplyAnonymousInBatches(
        Questionnaire $questionnaire,
        string $simplifiedPath,
        string $fullPath
    ): void {
        $anonymousRepliesOffset = 0;

        do {
            $anonymousReplies = $this->replyAnonymousRepository->getQuestionnaireAnonymousRepliesWithDistinctEmails(
                $questionnaire,
                $anonymousRepliesOffset,
                self::BATCH_SIZE
            );

            $this->exportAnonymousReplies(
                $anonymousReplies,
                $simplifiedPath,
                $fullPath,
                0 === $anonymousRepliesOffset && !$this->hasParticipants
            );

            $anonymousRepliesOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($anonymousReplies));
    }

    private function shouldExportParticipant(string $simplifiedPath, string $fullPath, Questionnaire $questionnaire): bool
    {
        if (!file_exists($simplifiedPath) || !file_exists($fullPath)) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($simplifiedPath, $fullPath);

        return $this->userRepository->hasNewParticipantsForAQuestionnaire($questionnaire, $oldestUpdateDate);
    }

    private function shouldExportReplyAnonymous(string $simplifiedPath, string $fullPath, Questionnaire $questionnaire): bool
    {
        if (!file_exists($simplifiedPath) || !file_exists($fullPath)) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($simplifiedPath, $fullPath);

        return $this->replyAnonymousRepository->hasNewAnonymousReplies($questionnaire, $oldestUpdateDate);
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->userNormalizer, $this->replyAnonymousNormalizer],
            [new CsvEncoder()]
        );
    }
}
