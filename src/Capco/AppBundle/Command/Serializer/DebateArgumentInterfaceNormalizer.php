<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableDebateContributionInterface;
use Capco\AppBundle\Command\Service\GeoIPReader;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class DebateArgumentInterfaceNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly DebateUrlResolver $debateUrlResolver,
        private readonly GeoIPReader $geoIPReader
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
            && $data instanceof ExportableDebateContributionInterface
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? false;

        /** @var ExportableDebateContributionInterface $object */
        $author = $object->getAuthor();
        $username = null !== $author ? $author->getUsername() : null;
        $email = null !== $author ? $author->getEmail() : null;
        $hasAccount = null !== $author ? $this->getReadableBoolean(true) : null;

        if ($object instanceof DebateAnonymousArgument) {
            $username = $object->getUsername();
            $email = $object->getEmail();
            $hasAccount = $this->getReadableBoolean(false);
        }

        $geoIpData = $this->geoIPReader->getGeoIPData(
            $object->getIpAddress(),
            ['geoip.city_name', 'geoip.country_name', 'geoip.region_name']
        );

        $debateArgumentArray = [
            self::EXPORT_CONTRIBUTION_ARGUMENT_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
            self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ID => null !== $author ? $author->getId() : null,
            self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_USERNAME => $username,
            self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_USER_TYPE_NAME => null !== $author ? $author->getId() : null,
            self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ZIP_CODE => null !== $author ? $author->getZipCode() : null,
            self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ACCOUNT => $hasAccount ?? null,
            self::EXPORT_CONTRIBUTION_ARGUMENT_CONTENT => $object->getBodyText(),
            self::EXPORT_CONTRIBUTION_ARGUMENT_TYPE => $this->getArgumentTypeTranslated($object->getType()),
            self::EXPORT_CONTRIBUTION_ARGUMENT_VOTE_NUMBER => $object->getVotes()->count(),
        ];

        if ($isFullExport) {
            $debateArgumentArray = [self::EXPORT_CONTRIBUTION_ARGUMENT_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt())] + $debateArgumentArray;
            $fullExportData = [
                self::EXPORT_CONTRIBUTION_ARGUMENT_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_ARGUMENT_TRASHED_AT => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_CONTRIBUTION_ARGUMENT_TRASHED_REASON => $object->getTrashedReason(),
                self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_IS_EMAIL_CONFIRMED => null !== $author ? $this->getReadableBoolean($author->isEmailConfirmed()) : null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_EMAIL => $email,
                self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_INTERNAL_COMMUNICATION => null !== $author ? $this->getReadableBoolean($author->isConsentInternalCommunication()) : null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_EXTERNAL_COMMUNICATION => null !== $author ? $this->getReadableBoolean($author->isConsentExternalCommunication()) : null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_DEBATE_URL => null !== $object->getDebate() ? $this->debateUrlResolver->__invoke($object->getDebate()) : null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_COUNTRY_NAME => $geoIpData['country_name'] ?? null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_REGION_NAME => $geoIpData['region_name'] ?? null,
                self::EXPORT_CONTRIBUTION_ARGUMENT_GEOIP_CITY_NAME => $geoIpData['city_name'] ?? null,
            ];

            $debateArgumentArray = array_merge($debateArgumentArray, $fullExportData);
        }

        return $this->translateHeaders($debateArgumentArray);
    }

    private function getArgumentTypeTranslated(string $type): string
    {
        return $this->translator->trans(self::EXPORT_CONTRIBUTION_ARGUMENT_TYPES[$type]);
    }
}
