<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\ParticipantRepository;
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
        EntityManagerInterface $entityManager,
        Filesystem $fileSystem,
        private readonly ParticipantsFilePathResolver $filePathResolver,
        private readonly ParticipantRepository $participantRepository,
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

        $paths[ExportVariantsEnum::SIMPLIFIED->value] = $this->filePathResolver->getSimplifiedExportPath($questionnaire->getStep());
        $paths[ExportVariantsEnum::FULL->value] = $this->filePathResolver->getFullExportPath($questionnaire->getStep());

        $this->exportUsersInBatches($questionnaire, $paths);
        $this->exportParticipantsInBatches($questionnaire, $paths);
    }

    /**
     * @param array<string, string> $paths
     */
    private function exportUsersInBatches(
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
     *                                     WE KEEP THIS FUNCTION FOR NOW IT FETCHES REPLIES THAT ARE OWNED BY PARTICIPANT, DELETE IT WHEN WE MIGRATE PARTICIPANT TO USER
     */
    private function exportParticipantsInBatches(
        Questionnaire $questionnaire,
        array $paths
    ): void {
        $offset = 0;

        do {
            $participants = $this->participantRepository->getQuestionnaireParticipants(
                $questionnaire,
                $offset,
                self::BATCH_SIZE
            );

            if ([] === $participants) {
                return;
            }

            $this->exportParticipants(
                $participants,
                $paths,
                0 === $offset && !$this->hasParticipants
            );

            $offset += self::BATCH_SIZE;
            $this->entityManager->clear();
        } while (self::BATCH_SIZE === \count($participants));
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [$this->participantNormalizer],
            [new CsvEncoder()]
        );
    }
}
