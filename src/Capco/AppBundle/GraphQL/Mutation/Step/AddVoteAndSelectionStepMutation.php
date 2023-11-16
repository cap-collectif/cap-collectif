<?php

namespace Capco\AppBundle\GraphQL\Mutation\Step;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddVoteAndSelectionStepMutation implements MutationInterface
{
    private AddStepService $addStepService;
    private EntityManagerInterface $em;

    public function __construct(AddStepService $addStepService, EntityManagerInterface $em)
    {
        $this->addStepService = $addStepService;
        $this->em = $em;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        /** * @var SelectionStep $step  */
        list('step' => $step) = $this->addStepService->addStep($input, $viewer, 'VOTE_AND_SELECTION');

        $requirements = [
            (new Requirement())->setType(Requirement::FIRSTNAME),
            (new Requirement())->setType(Requirement::LASTNAME),
            (new Requirement())->setType(Requirement::DATE_OF_BIRTH),
            (new Requirement())->setType(Requirement::POSTAL_ADDRESS),
        ];

        foreach ($requirements as $index => $requirement) {
            $requirement->setPosition($index);
            $this->em->persist($requirement);
            $step->addRequirement($requirement);
        }

        $this->em->flush();

        return ['step' => $step];
    }
}
