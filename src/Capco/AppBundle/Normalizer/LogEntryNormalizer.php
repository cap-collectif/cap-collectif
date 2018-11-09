<?php
namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Manager\LogManager;
use Gedmo\Loggable\Entity\LogEntry;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class LogEntryNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;
    private $logManager;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        LogManager $logManager
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->logManager = $logManager;
    }

    public function normalize($object, $format = null, array $context = array())
    {
        $groups = array_key_exists('groups', $context) ? $context['groups'] : [];

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
