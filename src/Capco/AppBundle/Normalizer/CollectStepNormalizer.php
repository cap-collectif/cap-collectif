<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepContributorCountResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalCountResolver;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class CollectStepNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly ObjectNormalizer $normalizer,
        private CollectStepProposalCountResolver $collectStepProposalCountResolver,
        private CollectStepContributorCountResolver $collectStepContributorCountResolver,
        private PromiseAdapterInterface $adapter,
        private LoggerInterface $logger
    ) {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Elasticsearch', $groups)) {
            return $data;
        }

        $proposalsCount = $this->collectStepProposalCountResolver->__invoke($object);

        $contributorsCount = 0;
        $contributorPromise = $this->collectStepContributorCountResolver
            ->__invoke($object)
            ->then(function ($value) use (&$contributorsCount) {
                $contributorsCount += $value;
            })
        ;

        $this->adapter->await($contributorPromise);

        $counters = [
            'proposals' => $proposalsCount,
            'contributors' => $contributorsCount,
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

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof CollectStep;
    }
}
