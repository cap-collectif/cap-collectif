<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ReplyNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly FormattedValueResponseTypeResolver $formattedValueResponseTypeResolver,
        private readonly MediaUrlResolver $mediaUrlResolver,
        private readonly ParticipantNormalizer $participantNormalizer,
    ) {
        parent::__construct($translator);
    }

    /**
     * @param array<string, null|bool|string> $context
     * @param mixed                           $data
     * @param null|mixed                      $format
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER])
            && $data instanceof Reply
            && !isset($context['groups']);
    }

    /**
     * @param Reply                $object
     * @param array<array<string>> $context
     *
     * @return array<string>
     */
    public function normalize($object, ?string $format = null, array $context = []): array
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isGrouped = ExportVariantsEnum::isGrouped($variant);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        $contributor = $object->getContributor();

        $responseArray = [
            self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_REPLY),
            self::EXPORT_CONTRIBUTION_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_AUTHOR_ID => $contributor->getId() ?? '',
            self::EXPORT_CONTRIBUTION_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
        ];

        if ($isFullExport) {
            $fullUserArray = [
                self::EXPORT_CONTRIBUTION_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_AUTHOR => $contributor->getUsername(),
                self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL => $contributor->getEmail(),
                self::EXPORT_CONTRIBUTION_AUTHOR_PHONE => $contributor->getPhone(),
                self::EXPORT_CONTRIBUTION_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTION_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_DRAFT => $this->getReadableBoolean($object->isDraft()),
                self::EXPORT_CONTRIBUTION_UNDRAFT_AT => $this->getNullableDatetime($object->getUndraftAt()),
                self::EXPORT_CONTRIBUTION_ACCOUNT => $this->getReadableBoolean($contributor instanceof User),
                self::EXPORT_CONTRIBUTION_INTERNAL_COMM => $this->getReadableBoolean($contributor->isConsentInternalCommunication()),
            ];

            $responseArray = array_merge($responseArray, $fullUserArray);
        } elseif ($isGrouped) {
            $contributorData = $this->participantNormalizer->getParticipantPersonnalData($contributor);
            $responseArray = array_merge(
                $contributorData,
                [
                    self::EXPORT_CONTRIBUTION_ID => $object->getId(),
                    self::EXPORT_CONTRIBUTION_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                ]
            );
        }

        $orderedQuestionColumns = $this->getOrderedQuestionColumns($object->getQuestionnaire());
        if ([] !== $orderedQuestionColumns) {
            $responseArray = array_merge($responseArray, array_fill_keys(array_values($orderedQuestionColumns), null));
        }

        /** @var AbstractResponse $response */
        foreach ($object->getResponses() as $response) {
            $question = $response->getQuestion();
            if (null === $question) {
                continue;
            }

            $questionId = (string) $question->getId();
            $questionTitle = $orderedQuestionColumns[$questionId] ?? $question->getTitle();
            if (null === $questionTitle) {
                continue;
            }

            if ($response instanceof MediaResponse) {
                $mediaUrls = array_map(
                    fn (Media $media) => $this->mediaUrlResolver->__invoke($media),
                    $response->getMedias()->toArray()
                );
                $responseArray[$questionTitle] = implode(', ', $mediaUrls);
            } elseif ($response instanceof ValueResponse) {
                $responseArray[$questionTitle] = $this->formattedValueResponseTypeResolver->__invoke($response);
            } else {
                $responseArray[$questionTitle] = null;
            }
        }

        return $this->translateHeaders($responseArray);
    }

    /**
     * @return array<string, string>
     */
    private function getOrderedQuestionColumns(?Questionnaire $questionnaire): array
    {
        if (null === $questionnaire) {
            return [];
        }

        $orderedQuestionColumns = [];
        $titleCounters = [];

        foreach ($questionnaire->getQuestions() as $questionnaireAbstractQuestion) {
            $question = $questionnaireAbstractQuestion->getQuestion();
            if (!$question instanceof AbstractQuestion) {
                continue;
            }

            $questionTitle = $question->getTitle();
            if (null === $questionTitle) {
                continue;
            }

            if (!isset($titleCounters[$questionTitle])) {
                $titleCounters[$questionTitle] = 0;
            }

            $columnName = $titleCounters[$questionTitle] > 0
                ? sprintf('%s (%d)', $questionTitle, $titleCounters[$questionTitle])
                : $questionTitle;

            ++$titleCounters[$questionTitle];

            $orderedQuestionColumns[(string) $question->getId()] = $columnName;
        }

        return $orderedQuestionColumns;
    }
}
