<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DeleteProjectDistrictMutation implements MutationInterface
{
    protected $logger;
    protected $em;
    protected $projectDistrictRepository;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        ProjectDistrictRepository $projectDistrictRepository
    ) {
        $this->logger = $logger;
        $this->em = $em;
        $this->projectDistrictRepository = $projectDistrictRepository;
    }

    public function __invoke(Argument $input): array
    {
        $projectDistrictId = $input->offsetGet('id');

        $projectDistrict = $this->projectDistrictRepository->find($projectDistrictId);

        if (!$projectDistrict) {
            throw new UserError(
                sprintf('Unknown project district with id: %s', $projectDistrictId)
            );
        }

        $this->em->remove($projectDistrict);
        $this->em->flush();

        // Set the id back into the object before return it.
        $projectDistrict->setId($projectDistrictId);

        return ['district' => $projectDistrict];
    }
}
