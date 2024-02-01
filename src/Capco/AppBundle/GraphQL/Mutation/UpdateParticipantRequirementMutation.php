<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ParticipantRequirement;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ParticipantRequirementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class UpdateParticipantRequirementMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;
    private ParticipantRequirementRepository $participantRequirementRepository;
    private LoggerInterface $logger;
    private ParticipantRepository $participantRepository;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        ParticipantRequirementRepository $participantRequirementRepository,
        LoggerInterface $logger,
        ParticipantRepository $participantRepository,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->participantRequirementRepository = $participantRequirementRepository;
        $this->logger = $logger;
        $this->participantRepository = $participantRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $value = $input->offsetGet('value');
        $requirementId = $input->offsetGet('requirementId');
        $participantToken = $input->offsetGet('participantToken');

        $participant = $this->participantRepository->findOneBy(['token' => $participantToken]);
        if (!$participant) {
            throw new UserError('No participant found');
        }

        $requirement = $this->globalIdResolver->resolve($requirementId);

        if (!$requirement) {
            $error = sprintf('Unknown requirement with id "%s"', $requirementId);
            $this->logger->error($error);

            throw new UserError($error);
        }

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

        $this->em->flush();

        return ['requirement' => $requirement, 'participant' => $participant];
    }
}
