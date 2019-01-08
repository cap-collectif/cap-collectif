<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\MapTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ChangeMapStyleMutation implements MutationInterface
{
    private $repository;
    private $em;

    public function __construct(MapTokenRepository $repository, EntityManagerInterface $em)
    {
        $this->repository = $repository;
        $this->em = $em;
    }

    public function __invoke(Argument $input): array
    {
        list($mapTokenId, $styleOwner, $styleId) = [
            $input->offsetGet('mapTokenId'),
            $input->offsetGet('styleOwner'),
            $input->offsetGet('styleId'),
        ];

        $mapTokenId = GlobalId::fromGlobalId($mapTokenId)['id'];

        $mapToken = $this->repository->find($mapTokenId);

        if (!$mapToken) {
            throw new \RuntimeException('Could not find Map Token with id ' . $mapTokenId);
        }

        $mapToken->setStyleOwner($styleOwner)->setStyleId($styleId);

        $this->em->flush();

        return compact('mapToken');
    }
}
