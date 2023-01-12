<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

abstract class BaseDeleteMutation implements MutationInterface
{
    protected EntityManagerInterface $em;
    protected MediaProvider $mediaProvider;

    public function __construct(EntityManagerInterface $em, MediaProvider $mediaProvider)
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
