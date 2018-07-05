<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\UserRequirement;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class UpdateRequirementMutation implements MutationInterface
{
    private $em;
    private $requirementRepository;
    private $userRequirementRepository;
    private $logger;

    public function __construct(
      EntityManagerInterface $em,
      RequirementRepository $requirementRepository,
      UserRequirementRepository $userRequirementRepository,
      LoggerInterface $logger)
    {
        $this->em = $em;
        $this->requirementRepository = $requirementRepository;
        $this->userRequirementRepository = $userRequirementRepository;
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

        $userRequirement = $this->userRequirementRepository->findOneBy(['requirement' => $requirement, 'user' => $user]);

        if (!$userRequirement) {
            $userRequirement = new UserRequirement($user, $requirement, $value);
            $this->em->persist($userRequirement);
        } else {
            $userRequirement->setValue($value);
        }

        $this->em->flush();

        return ['requirement' => $requirement, 'viewer' => $user];
    }
}
