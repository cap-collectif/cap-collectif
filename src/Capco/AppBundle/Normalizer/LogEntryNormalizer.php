<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Manager\LogManager;
use Gedmo\Loggable\Entity\LogEntry;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class LogEntryNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(private UrlGeneratorInterface $router, private readonly ObjectNormalizer $normalizer, private LogManager $logManager)
    {
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

        $data['sentences'] = $this->logManager->getSentencesForLog($object);

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof LogEntry;
    }
}
