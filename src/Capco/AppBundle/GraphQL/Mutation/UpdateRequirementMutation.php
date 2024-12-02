<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserRequirement;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\Repository\UserRequirementRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class UpdateRequirementMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly RequirementRepository $requirementRepository, private readonly UserRequirementRepository $userRequirementRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
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
