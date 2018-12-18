<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class CollectStepNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $normalizer;

    public function __construct(ObjectNormalizer $normalizer)
    {
        $this->normalizer = $normalizer;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Elasticsearch', $groups)) {
            return $data;
        }

        $counters = [
            'proposals' => $object->getProposalsCount(),
            'contributors' => $object->getContributorsCount(),
        ];

        $remainingTime = $object->getRemainingTime();
        if ($remainingTime) {
            if ($object->isClosed()) {
                $counters['remainingDays'] = $remainingTime['days'];
            } elseif ($object->isOpen()) {
                if ($remainingTime['days'] > 0) {
                    $counters['remainingDays'] = $remainingTime['days'];
                } else {
                    $counters['remainingHours'] = $remainingTime['hours'];
                }
            }
        }

        $data['counters'] = $counters;

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof CollectStep;
    }
}
