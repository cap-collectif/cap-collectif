<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ReportingNormalizer extends BaseNormalizer implements NormalizerInterface, ExportableContributionInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_reporting';

    public function __construct(
        TranslatorInterface $translator,
        private readonly ProposalNormalizer $proposalNormalizer
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
            && $data instanceof Reporting
            && null !== $data->getProposal()
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        /** @var Reporting $object */
        $author = $object->getReporter();

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_REPORTINGS_ID => $object->getId(),
                self::EXPORT_PROPOSAL_REPORTINGS_BODY => $object->getBody(),
                self::EXPORT_PROPOSAL_REPORTINGS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_ID => $author?->getId(),
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USERNAME => $author?->getUsername(),
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED => $author?->isEmailConfirmed(),
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_ID => $author?->getUserType()?->getId(),
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_NAME => $author?->getUserType()?->getName(),
            ];
        }
        $proposalNormalized = $this->proposalNormalizer->normalize(
            $object->getProposal(),
            null,
            [
                'step' => $context['step'],
                BaseNormalizer::EXPORT_VARIANT => $variant,
                'questionsResponses' => $context['questionsResponses'],
            ]
        );
        $proposalNormalized[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $proposalNormalized, $fullExportData), array_keys($context['questionsResponses']));
    }
}
