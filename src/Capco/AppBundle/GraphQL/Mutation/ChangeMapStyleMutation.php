<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MapTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ChangeMapStyleMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private MapTokenRepository $repository, private EntityManagerInterface $em)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
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
