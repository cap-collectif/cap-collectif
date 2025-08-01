<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ReplyAnonymousNormalizer;
use Capco\AppBundle\Command\Serializer\ReplyNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class QuestionnaireContributionExporter extends ContributionExporter
{
    private const BATCH_SIZE = 1000;
    protected SerializerInterface $serializer;
    private bool $withHeaders;

    public function __construct(
        protected EntityManagerInterface $entityManager,
        private readonly ReplyRepository $replyRepository,
        private readonly ReplyAnonymousRepository $anonymousReplyRepository,
        private readonly QuestionnaireRepository $questionnaireRepository,
        private readonly ReplyNormalizer $replyNormalizer,
        private readonly ReplyAnonymousNormalizer $anonymousReplyNormalizer,
        protected ContributionsFilePathResolver $contributionsFilePathResolver,
        Filesystem $fileSystem,
        private readonly LoggerInterface $logger
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($this->entityManager, $this->serializer, $fileSystem, $this->contributionsFilePathResolver);
    }

    /**
     * @param array<string, string> $paths
     */
    public function exportQuestionnaireContributions(
        QuestionnaireStep $questionnaireStep,
        ?string $delimiter,
        array $paths
    ): void {
        $questionnaire = $questionnaireStep->getQuestionnaire();
        if (null === $questionnaire) {
            return;
        }

        if ($this->shouldExport($questionnaireStep, $questionnaire, $paths)) {
            $this->setDelimiter($delimiter);

            $this->exportQuestionnaireRepliesInBatches($questionnaire);
            $this->exportQuestionnaireAnonymousRepliesInBatches($questionnaire);
        }
    }

    protected function getOldestUpdateDate(string $simplifiedPath, string $fullPath): \DateTime
    {
        $simplifiedFileDate = filemtime($simplifiedPath);
        $fullFileDate = filemtime($fullPath);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExport(QuestionnaireStep $questionnaireStep, string $questionnaireId, array $paths): bool
    {
        if (!file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths['simplified'], $paths['full']);

        try {
            return $this->questionnaireRepository->hasRecentRepliesOrUpdatedUsers($questionnaireId, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    private function exportQuestionnaireRepliesInBatches(Questionnaire $questionnaire): void
    {
        $replyOffset = 0;
        if (!isset($this->withHeaders)) {
            $this->withHeaders = true;
        }

        do {
            $replies = $this->replyRepository->getBatchOfPublishedReplies(
                $questionnaire->getId(),
                $replyOffset,
                self::BATCH_SIZE
            );

            if ([] === $replies) {
                break;
            }

            $this->exportContributions(
                $this->sortQuestionsByResponsesPosition($replies),
                $questionnaire->getStep(),
                0 === $replyOffset
            );

            $this->withHeaders = false;
            $replyOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($replies));
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [
                $this->replyNormalizer,
                $this->anonymousReplyNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    private function exportQuestionnaireAnonymousRepliesInBatches(Questionnaire $questionnaire): void
    {
        $anonymousRepliesOffset = 0;
        if (!isset($this->withHeaders)) {
            $this->withHeaders = true;
        }

        do {
            $anonymousReplies = $this->anonymousReplyRepository->getQuestionnaireAnonymousReplies(
                $questionnaire,
                $anonymousRepliesOffset,
                self::BATCH_SIZE
            );

            if ([] === $anonymousReplies) {
                break;
            }

            $this->exportContributions(
                $this->sortQuestionsByResponsesPosition($anonymousReplies),
                $questionnaire->getStep(),
                $this->withHeaders
            );

            $this->withHeaders = false;
            $anonymousRepliesOffset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($anonymousReplies));
    }

    /**
     * @param AbstractReply[] $replies
     *
     * @return AbstractReply[]
     */
    private function sortQuestionsByResponsesPosition(array $replies): array
    {
        $sortedReplies = [];

        foreach ($replies as $reply) {
            $response = $reply->getResponses()[0];

            $position = $response->getPosition();

            if (!isset($sortedReplies[$position])) {
                $sortedReplies[$position] = [];
            }

            $sortedReplies[$position][] = $reply;
        }

        ksort($sortedReplies);

        $flattenedReplies = [];
        $seenIds = [];

        foreach ($sortedReplies as $repliesAtPosition) {
            foreach ($repliesAtPosition as $reply) {
                $id = $reply->getId();
                if (!isset($seenIds[$id])) {
                    $flattenedReplies[] = $reply;
                    $seenIds[$id] = true;
                }
            }
        }

        return $flattenedReplies;
    }
}
