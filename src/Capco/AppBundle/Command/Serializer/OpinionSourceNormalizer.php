<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionSourceNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_opinion_source';

    public function __construct(
        TranslatorInterface $translator,
        private readonly OpinionNormalizer $opinionNormalizer
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
            && $data instanceof Source
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);
        $author = $object->getAuthor();
        $opinion = $object->getOpinion();
        $votes = $object->getVotes();

        if ($isFullExport) {
            $opinionSourceArray = [
                self::EXPORT_CONTRIBUTION_SOURCES_ID => $object->getId(),
                self::EXPORT_CONTRIBUTION_SOURCES_RELATED_ID => null !== $opinion ? $opinion->getId() : null,
                self::EXPORT_CONTRIBUTION_SOURCES_RELATED_KIND => null !== $opinion ? $opinion->getKind() : null,
                self::EXPORT_CONTRIBUTION_SOURCES_AUTHOR_ID => null !== $author ? $author->getId() : null,
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_STATUS => $object->getTrashedStatus(),
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_AT => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHEDREASON => $object->getTrashedReason(),
                self::EXPORT_CONTRIBUTION_SOURCES_BODY => $object->getBodyText(),
                self::EXPORT_CONTRIBUTION_SOURCES_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTION_SOURCES_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_SOURCES_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_SOURCES_VOTES_COUNT => null !== $votes ? $votes->count() : null,
            ];
        }

        $opinionArray = $this->opinionNormalizer->normalize($object->getOpinion(), null, [BaseNormalizer::EXPORT_VARIANT => $variant, 'skip' => true]);
        $opinionSourceArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $opinionArray, $opinionSourceArray));
    }
}
