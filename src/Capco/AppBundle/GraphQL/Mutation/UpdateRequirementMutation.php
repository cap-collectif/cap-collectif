<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Requirement;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\UserRequirement;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

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
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->requirementRepository = $requirementRepository;
        $this->userRequirementRepository = $userRequirementRepository;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $value = $input->offsetGet('value');

        // Requirement
        $requirementId = GlobalId::fromGlobalId($input->offsetGet('requirement'))['id'];
        $requirement = $this->requirementRepository->find($requirementId);

        if (!$requirement) {
            $error = sprintf('Unknown requirement with id "%s"', $requirementId);
            $this->logger->error($error);

            throw new UserError($error);
        }

        $userRequirement = $this->userRequirementRepository->findOneBy([
            'requirement' => $requirement,
            'user' => $user,
        ]);

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
