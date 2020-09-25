<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class AbstractResponseNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    private ObjectNormalizer $normalizer;

    public function __construct(ObjectNormalizer $normalizer)
    {
        $this->normalizer = $normalizer;
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);
        if (!($object instanceof MediaResponse)) {
            if (\is_string($responseValue = $object->getValue())) {
                $data['textValue'] = $responseValue;
            } else {
                $data['objectValue'] = $responseValue;
            }
        } else {
            /** @var PersistentCollection $medias */
            $medias = $object->getMedias();
            $data['medias'] = array_map(static function ($media) {
                return $media->getId();
            }, $medias->toArray());
        }

        return $data;
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof AbstractResponse;
    }
}
