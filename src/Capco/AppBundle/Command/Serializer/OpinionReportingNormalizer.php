<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Enum\ReportingType;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionReportingNormalizer extends BaseNormalizer implements NormalizerInterface
{
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
                && $data instanceof Reporting
                && null !== $data->getRelated()
                && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? null;

        $related = $object->getRelated();
        $reporter = $object->getReporter();

        if ($isFullExport) {
            $reportingArray = [
                self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_ID => null !== $related ? $related->getId() : null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_KIND => null !== $related ? $related->getKind() : null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_ID => $object->getId(),
                self::EXPORT_CONTRIBUTION_REPORTINGS_AUTHOR_ID => null !== $reporter ? $reporter->getId() : null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_TYPE => $this->getReportingType($object),
                self::EXPORT_CONTRIBUTION_REPORTINGS_BODY => $object->getBody(),
                self::EXPORT_CONTRIBUTION_REPORTINGS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
            ];
        }

        $opinionArray = $this->opinionNormalizer->normalize($object->getRelated(), null, ['is_full_export' => $isFullExport, 'skip' => true]);
        $reportingArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->getTranslatedRelatedContribution($object);

        return $this->translateHeaders(array_merge((array) $opinionArray, $reportingArray));
    }

    private function getReportingType(Reporting $object): ?string
    {
        $reportingStatuses = [
            ReportingType::SEX => 'SEXUAL',
            ReportingType::OFF => 'OFFENDING',
            ReportingType::SPAM => 'SPAM',
            ReportingType::ERROR => 'ERROR',
            ReportingType::OFF_TOPIC => 'OFF_TOPIC',
        ];

        return $reportingStatuses[$object->getStatus()] ?? null;
    }

    private function getTranslatedRelatedContribution(Reporting $report): ?string
    {
        $related = $report->getRelated();

        return match ($related) {
            $related instanceof Opinion => $this->translator->trans('export_contribution_type_opinion_report'),
            $related instanceof Argument => $this->translator->trans('export_contribution_type_opinion_argument_report'),
            $related instanceof OpinionVersion => $this->translator->trans('export_contribution_type_opinion_version_report'),
            $related instanceof Source => $this->translator->trans('export_contribution_type_opinion_source_report'),
            default => null,
        };
    }
}
