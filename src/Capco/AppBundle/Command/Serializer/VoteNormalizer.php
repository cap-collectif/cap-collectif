<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Command\Service\GeoIPReader;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\Debate\DebateUrlResolver;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class VoteNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(TranslatorInterface $translator, private readonly GeoIPReader $geoIPReader, private readonly DebateUrlResolver $debateUrlResolver)
    {
        parent::__construct($translator);
    }

    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER])
            && $data instanceof DebateVote || $data instanceof DebateAnonymousVote
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = []): array
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);
        $author = null;
        /** @var DebateAnonymousVote|DebateVote $object */
        if ($object instanceof DebateVote) {
            $author = $object->getUser();
        }
        $userType = null !== $author ? $author->getUserType() : null;
        $debate = $object->getDebate();

        $geoIpData = $this->geoIPReader->getGeoIPData(
            $object->getIpAddress(),
            ['geoip.city_name', 'geoip.country_name', 'geoip.region_name']
        );

        $voteArray = [
            self::EXPORT_VOTE_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
            self::EXPORT_VOTE_TYPE => $this->getVoteTypeTranslated($object->getType()),
            self::EXPORT_VOTE_AUTHOR_ID => $author?->getId(),
        ];

        if ($isFullExport) {
            $data['widgetOriginUrl'] = $object->getWidgetOriginUrl();
            $data['origin'] = $object->getOrigin();

            $fullExportData = [
                self::EXPORT_VOTE_SOURCE => $this->getVoteSource($data),
                self::EXPORT_VOTE_AUTHOR_ZIP_CODE => null !== $author ? $author->getZipCode() : null,
                self::EXPORT_VOTE_AUTHOR_USERNAME => null !== $author ? $author->getUsername() : null,
                self::EXPORT_VOTE_AUTHOR_IS_EMAIL_CONFIRMED => null !== $author ? $this->getReadableBoolean($author->isEmailConfirmed()) : null,
                self::EXPORT_VOTE_AUTHOR_EMAIL => null !== $author ? $author->getEmail() : null,
                self::EXPORT_VOTE_AUTHOR_USER_TYPE_NAME => null !== $userType ? $userType->getName() : null,
                self::EXPORT_VOTE_DEBATE_URL => null !== $debate ? $this->debateUrlResolver->__invoke($debate) : null,
                self::EXPORT_VOTE_GEOIP_COUNTRY_CODE => $geoIpData['country_name'] ?? null,
                self::EXPORT_VOTE_GEOIP_REGION_NAME => $geoIpData['region_name'] ?? null,
                self::EXPORT_VOTE_GEOIP_CITY_NAME => $geoIpData['city_name'] ?? null,
            ];

            $voteArray = array_merge($voteArray, $fullExportData);
        }

        return $this->translateHeaders($voteArray);
    }

    /**
     * @param array<string, null|string> $data
     */
    private function getVoteSource(array $data): string
    {
        if ('WIDGET' === $data['origin'] && $data['widgetOriginUrl']) {
            return 'WIDGET : ' . $data['widgetOriginUrl'];
        }
        if ('INTERNAL' === $data['origin']) {
            return 'APPLICATION';
        }

        return $data['origin'];
    }

    private function getVoteTypeTranslated(string $type): string
    {
        return $this->translator->trans(self::EXPORT_VOTE_TYPES[$type]);
    }
}
