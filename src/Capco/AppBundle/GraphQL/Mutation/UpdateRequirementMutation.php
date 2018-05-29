<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\UserRequirement;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class UpdateRequirementMutation
{
    private $em;
    private $requirementRepository;
    private $logger;

    public function __construct(
      EntityManagerInterface $em,
      RequirementRepository $requirementRepository,
      LoggerInterface $logger)
    {
        $this->em = $em;
        $this->requirementRepository = $requirementRepository;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $requirementId = $input->offsetGet('requirement');
        $value = $input->offsetGet('value');

        // Requirement
        $requirement = $this->requirementRepository->find($requirementId);

        if (!$requirement) {
            throw new UserError(sprintf('Unknown requirement with id "%s"', $requirementId));
        }

        $userRequirement = new UserRequirement($user, $requirement, $value);

        $this->em->persist($userRequirement);
        $this->em->flush();

        return ['requirement' => $requirement, 'viewer' => $user];
    }
}
