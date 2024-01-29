<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;

class DeleteGlobalDistrictMutation implements MutationInterface
{
    use MutationTrait;
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
        $this->formatInput($input);
        $globalDistrictId = $input->offsetGet('id');

        $globalDistrict = $this->globalIdResolver->resolve($globalDistrictId, $viewer);

        if (!$globalDistrict instanceof GlobalDistrict) {
            $error = [
                'message' => sprintf('Unknown project district with id: %s', $globalDistrictId),
            ];
            $this->logger->error(
                sprintf('Unknown project district with id: %s', $globalDistrictId)
            );

            return ['deletedDistrictId' => null, 'userErrors' => [$error]];
        }

        $this->em->remove($globalDistrict);
        $this->em->flush();

        return ['deletedDistrictId' => $globalDistrictId, 'userErrors' => []];
    }
}
