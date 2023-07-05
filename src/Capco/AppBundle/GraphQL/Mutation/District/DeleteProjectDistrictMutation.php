<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;

class DeleteProjectDistrictMutation implements MutationInterface
{
    protected LoggerInterface $logger;
    protected EntityManagerInterface $em;
    protected GlobalIdResolver $globalIdResolver;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, $viewer): array
    {
        $projectDistrictId = $input->offsetGet('id');

        $projectDistrict = $this->globalIdResolver->resolve($projectDistrictId, $viewer);

        if (!$projectDistrict instanceof ProjectDistrict) {
            $error = [
                'message' => sprintf('Unknown project district with id: %s', $projectDistrictId),
            ];
            $this->logger->error(
                sprintf('Unknown project district with id: %s', $projectDistrictId)
            );

            return ['deletedDistrictId' => null, 'userErrors' => [$error]];
        }

        $this->em->remove($projectDistrict);
        $this->em->flush();

        return ['deletedDistrictId' => $projectDistrictId, 'userErrors' => []];
    }
}
