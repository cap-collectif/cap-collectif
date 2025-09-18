<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ReplyNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Repository\ReplyRepository;
use Doctrine\ORM\EntityManagerInterface;
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
        private readonly ReplyNormalizer $replyNormalizer,
        protected ContributionsFilePathResolver $contributionsFilePathResolver,
        Filesystem $fileSystem,
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

        $this->setDelimiter($delimiter);

        $this->exportQuestionnaireRepliesInBatches($questionnaire);
    }

    /**
     * @param array<ExportVariantsEnum::value, string> $paths
     */
    protected function getOldestUpdateDate(array $paths): \DateTime
    {
        $filesDate = array_map(fn ($path) => filemtime($path), $paths);

        if (empty($filesDate)) {
            throw new \Exception('Array cannot be empty');
        }

        return (new \DateTime())->setTimestamp(min($filesDate));
    }

    protected function setDelimiter(?string $delimiter): void
    {
        if ($delimiter) {
            $this->delimiter = $delimiter;
        }
    }

    private function exportQuestionnaireRepliesInBatches(Questionnaire $questionnaire): void
    {
        $replyOffset = 0;
        if (!isset($this->withHeaders)) {
            $this->withHeaders = true;
        }

        do {
            $replies = $this->replyRepository->getBatchOfReplies(
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
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @param Reply[] $replies
     *
     * @return Reply[]
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
