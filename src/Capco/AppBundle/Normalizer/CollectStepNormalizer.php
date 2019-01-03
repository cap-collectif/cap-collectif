<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalCountResolver;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class CollectStepNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;

    private $normalizer;
    private $collectStepProposalCountResolver;
    private $adapter;
    private $logger;

    public function __construct(
        ObjectNormalizer $normalizer,
        CollectStepProposalCountResolver $collectStepProposalCountResolver,
        PromiseAdapterInterface $adapter,
        LoggerInterface $logger
    ) {
        $this->normalizer = $normalizer;
        $this->collectStepProposalCountResolver = $collectStepProposalCountResolver;
        $this->adapter = $adapter;
        $this->logger = $logger;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array('Elasticsearch', $groups)) {
            return $data;
        }
        $count = 0;
        $promise = $this->collectStepProposalCountResolver
            ->__invoke($object)
            ->then(function ($value) use (&$count) {
                $count += $value;
            });

        $this->adapter->await($promise);

        $counters = [
            'proposals' => $count,
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

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof CollectStep;
    }
}
