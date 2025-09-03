<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionAppendixNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_appendix';

    public function __construct(TranslatorInterface $translator, private readonly OpinionNormalizer $opinionNormalizer)
    {
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
            && $data instanceof OpinionAppendix
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        /** @var AppendixType $appendixType */
        $appendixType = $object->getAppendixType();

        $opinionAppendixId = $object->getOpinion()->getId();
        $contextElementArray = [
            self::EXPORT_CONTRIBUTION_ID => $opinionAppendixId,
        ];

        if ($isFullExport) {
            $contextElementArray = [
                self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_TITLE => $appendixType->getTitle(),
                self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_BODY_TEXT => $object->getBodyText(),
            ];
        }

        $opinionArray = $this->opinionNormalizer->normalize($object->getOpinion(), null, [BaseNormalizer::EXPORT_VARIANT => $variant, 'skip' => true]);
        $contextElementArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $opinionArray, $contextElementArray));
    }
}
