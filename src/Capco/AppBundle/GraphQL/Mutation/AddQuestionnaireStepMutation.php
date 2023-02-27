<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Service\AddStepService;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddQuestionnaireStepMutation implements MutationInterface
{
    private AddStepService $addStepService;
    private EntityManagerInterface $em;

    public function __construct(AddStepService $addStepService, EntityManagerInterface $em) {
        $this->addStepService = $addStepService;
        $this->em = $em;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $input->offsetSet('stepType', 'QUESTIONNAIRE');

        /** * @var $step QuestionnaireStep  */
        ['step' => $step] = $this->addStepService->addStep($input, $viewer);

        $questionnaireTitle = "{$step->getTitle()} - Questionnaire";
        $questionnaire = (new Questionnaire())->setTitle($questionnaireTitle);
        $step->setQuestionnaire($questionnaire);

        $this->em->flush();

        return ['step' => $step];
    }

}
