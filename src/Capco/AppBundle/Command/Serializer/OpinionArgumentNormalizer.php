<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\Argument\ArgumentUrlResolver;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionArgumentNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_argument';

    public function __construct(
        private readonly ArgumentUrlResolver $argumentUrlResolver,
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
            && $data instanceof Argument
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);
        $author = $object->getAuthor();

        $argumentArray = [
            self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => $object->getOpinion()->getId(),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => $author ? $author->getId() : null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => $object->getType(),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => $object->getBody(),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => $this->argumentUrlResolver->__invoke($object),
        ];

        if ($isFullExport) {
            $argumentArray = [
                self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => $object->getId(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => $author ? $author->getId() : null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => $this->translator->trans($object->getTypeAsString()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => $object->getBody(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => $this->argumentUrlResolver->__invoke($object),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => $object->getOpinion()->getId(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_KIND => $object->getOpinion()->getKind(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED => $this->getReadableBoolean($object->isTrashed()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_STATUS => $object->getTrashedStatus(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_AT => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_REASON => $object->getTrashedReason(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_VOTES_COUNT => $object->getVotes()->count(),
            ];
        }

        $opinionArray = $this->opinionNormalizer->normalize($object->getOpinion(), null, ['skip' => true, BaseNormalizer::EXPORT_VARIANT => $variant]);
        $argumentArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $opinionArray, $argumentArray));
    }
}
