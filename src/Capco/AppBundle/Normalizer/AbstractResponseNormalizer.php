<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class AbstractResponseNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(private readonly ObjectNormalizer $normalizer)
    {
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
                // We do not need HTML tags in ES.
                $data['textValue'] = strip_tags($responseValue);
            } else {
                $data['objectValue'] = $responseValue;
            }
        } else {
            /** @var PersistentCollection $medias */
            $medias = $object->getMedias();
            $data['medias'] = array_map(static fn ($media) => $media->getId(), $medias->toArray());
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
