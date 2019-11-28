<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Sonata\MediaBundle\Provider\ImageProvider;

abstract class BaseDeleteMutation implements MutationInterface
{
    protected $em;
    protected $mediaProvider;

    public function __construct(EntityManagerInterface $em, ImageProvider $mediaProvider)
    {
        $this->em = $em;
        $this->mediaProvider = $mediaProvider;
    }

    public function removeMedia(Media $media): void
    {
        $this->mediaProvider->removeThumbnails($media);
        $this->em->remove($media);
    }
}
