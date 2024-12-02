<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

abstract class BaseDeleteMutation implements MutationInterface
{
    public function __construct(protected EntityManagerInterface $em, protected MediaProvider $mediaProvider)
    {
    }

    public function removeMedia(Media $media): void
    {
        $this->em->remove($media);
    }
}
