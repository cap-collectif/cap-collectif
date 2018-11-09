<?php
namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class SynthesisElementNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;

    public function __construct(UrlGeneratorInterface $router, ObjectNormalizer $normalizer)
    {
        $this->router = $router;
        $this->normalizer = $normalizer;
    }

    public function normalize($object, $format = null, array $context = array())
    {
        $data = $this->normalizer->normalize($object, $format, $context);
        $data['_links']['self']['href'] = $this->router->generate(
            'get_synthesis_element',
            [
                'synthesis_id' => $object->getSynthesis()->getId(),
                'element_id' => $object->getId(),
            ],
            true
        );
        $data['_links']['history']['href'] = $this->router->generate(
            'get_synthesis_element_history',
            [
                'synthesis_id' => $object->getSynthesis()->getId(),
                'element_id' => $object->getId(),
            ],
            true
        );
        $data['logs'] = [];

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof SynthesisElement;
    }
}
