<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Service\ParticipantContributionCounter;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class ParticipantNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly ParticipantContributionCounter $contributionCounter
    ) {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    /**
     * @param mixed      $object
     * @param null|mixed $format
     *
     * @return array<string, mixed>
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        $groups = isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        $data = [
            'id' => $object->getId(),
            'email' => $object->getEmail(),
            'username' => $object->getUsername(),
            'firstname' => $object->getFirstname(),
            'lastname' => $object->getLastname(),
            'phone' => $object->getPhone(),
            'createdAt' => $object->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'isEmailConfirmed' => $object->isEmailConfirmed(),
            'isConsentInternalCommunication' => $object->isConsentInternalCommunication(),
            'objectType' => $object::getElasticsearchTypeName(),
        ];

        if (\in_array('ElasticsearchParticipant', $groups)) {
            $this->addParticipationCounts($data, $object);
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Participant;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function addParticipationCounts(array &$data, Participant $participant): void
    {
        $counts = $this->contributionCounter->getCountsForParticipant($participant);

        $data['participationsCountByProject'] = $counts['byProject'];
        $data['participationsCountByStep'] = $counts['byStep'];
        $data['totalParticipationsCount'] = $counts['total'];
    }
}
