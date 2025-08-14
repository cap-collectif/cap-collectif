<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ParticipantRequirement;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantRequirementRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class UpdateParticipantRequirementMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private ParticipantRequirementRepository $participantRequirementRepository, private LoggerInterface $logger, private GlobalIdResolver $globalIdResolver, private ParticipantHelper $participantHelper)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $values = $input->offsetGet('values');
        $participantToken = $input->offsetGet('participantToken');

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

        $requirements = [];

        foreach ($values as $valueInput) {
            $value = $valueInput['value'];
            $requirementId = $valueInput['requirementId'];

            $requirement = $this->globalIdResolver->resolve($requirementId);

            if (!$requirement) {
                $error = sprintf('Unknown requirement with id "%s"', $requirementId);
                $this->logger->error($error);

                throw new UserError($error);
            }

            $requirements[] = $requirement;

            $participantRequirement = $this->participantRequirementRepository->findOneBy([
                'requirement' => $requirement,
                'participant' => $participant,
            ]);

            if (!$participantRequirement) {
                $participantRequirement = new ParticipantRequirement($participant, $requirement, $value);
                $this->em->persist($participantRequirement);
            } else {
                $participantRequirement->setValue($value);
            }
        }

        $this->em->flush();

        return ['requirements' => $requirements, 'participant' => $participant];
    }
}
