<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\GraphQL\Mutation\CreateQuestionnaireMutation;
use Capco\AppBundle\GraphQL\Mutation\UpdateQuestionnaireConfigurationMutation;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class PreConfigureProjectQuestionnairePersister
{
    private CreateQuestionnaireMutation $createQuestionnaireMutation;
    private UpdateQuestionnaireConfigurationMutation $updateQuestionnaireConfigurationMutation;
    private EntityManagerInterface $em;
    private AbstractQuestionRepository $abstractQuestionRepository;
    private QuestionChoiceRepository $questionChoiceRepository;

    public function __construct(
        EntityManagerInterface $em,
        QuestionChoiceRepository $questionChoiceRepository,
        AbstractQuestionRepository $abstractQuestionRepository,
        CreateQuestionnaireMutation $createQuestionnaireMutation,
        UpdateQuestionnaireConfigurationMutation $updateQuestionnaireConfigurationMutation
    ) {
        $this->em = $em;
        $this->questionChoiceRepository = $questionChoiceRepository;
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->createQuestionnaireMutation = $createQuestionnaireMutation;
        $this->updateQuestionnaireConfigurationMutation = $updateQuestionnaireConfigurationMutation;
    }

    public function addQuestionnaire(
        array $questionnairesInput,
        string $ownerId,
        User $viewer
    ): array {
        if (empty($questionnairesInput)) {
            return [];
        }

        $questionnaireTitleToIdMap = [];

        foreach ($questionnairesInput as $questionnaireInput) {
            list('questionnaire' => $questionnaire) = $this->createQuestionnaireMutation->__invoke(
                new Argument([
                    'title' => $questionnaireInput['title'],
                    'owner' => $ownerId,
                ]),
                $viewer
            );

            $questionsWithJumps = $this->getQuestionsWithJumps($questionnaireInput);

            /** * @var $updatedQuestionnaire Questionnaire */
            list(
                'questionnaire' => $updatedQuestionnaire,
            ) = $this->updateQuestionnaireConfigurationMutation->__invoke(
                new Argument([
                    'questionnaireId' => GlobalId::toGlobalId(
                        'Questionnaire',
                        $questionnaire->getId()
                    ),
                    'questions' => $questionnaireInput['questions'],
                    'description' => $questionnaireInput['description'],
                ]),
                $viewer
            );

            $this->addJumpsToQuestionnaire($updatedQuestionnaire, $questionsWithJumps);

            $questionnaireTitleToIdMap[$questionnaireInput['title']] = $questionnaire->getId();
        }

        return $questionnaireTitleToIdMap;
    }

    private function getQuestionsWithJumps(array &$questionnaireInput): array
    {
        $questionsWithJumps = [];
        foreach ($questionnaireInput['questions'] as &$question) {
            $questionsWithJumps[] = [
                'title' => $question['question']['title'],
                'alwaysJumpDestinationQuestion' =>
                    $question['question']['alwaysJumpDestinationQuestion'],
                'jumps' => $question['question']['jumps'],
            ];
            $question['question']['alwaysJumpDestinationQuestion'] = null;
            $question['question']['jumps'] = [];
        }

        return $questionsWithJumps;
    }

    private function addJumpsToQuestionnaire(
        Questionnaire $questionnaire,
        array $questionsWithJumps
    ) {
        if (empty($questionsWithJumps)) {
            return;
        }

        foreach ($questionsWithJumps as $questionsWithJump) {
            $title = $questionsWithJump['title'];
            /** * @var $question MultipleChoiceQuestion */
            $question = $this->abstractQuestionRepository->findOneByQuestionnaireAndTitle(
                $questionnaire,
                $title
            );

            $alwaysJumpDestinationQuestionString =
                $questionsWithJump['alwaysJumpDestinationQuestion'];
            if ($alwaysJumpDestinationQuestionString) {
                $alwaysJumpDestinationQuestion = $this->abstractQuestionRepository->findOneByQuestionnaireAndTitle(
                    $questionnaire,
                    $alwaysJumpDestinationQuestionString
                );
                $question->setAlwaysJumpDestinationQuestion($alwaysJumpDestinationQuestion);
            }

            $jumpsArray = $questionsWithJump['jumps'];
            if (empty($jumpsArray)) {
                continue;
            }

            foreach ($jumpsArray as $jumpArrayIndex => $jumpArray) {
                $jump = new LogicJump();
                $jump->setPosition($jumpArrayIndex);
                $this->addJumpConditions(
                    $jumpArray['conditions'],
                    $question,
                    $questionnaire,
                    $jump
                );
                $this->addOrigin($questionnaire, $jumpArray['origin'], $jump);
                $this->addDestination($questionnaire, $jumpArray['destination'], $jump);
                $question->addJump($jump);
                $this->em->persist($jump);
            }
        }
        $this->em->flush();
    }

    private function addJumpConditions(
        array $conditions,
        MultipleChoiceQuestion $question,
        Questionnaire $questionnaire,
        LogicJump $jump
    ): void {
        foreach ($conditions as $conditionIndex => $condition) {
            $choiceValue = $this->questionChoiceRepository->findOneByQuestionAndTitle(
                $question,
                $condition['value']
            );
            $operator = $condition['operator'];
            $jumpQuestion = $this->abstractQuestionRepository->findOneByQuestionnaireAndTitle(
                $questionnaire,
                $condition['question']
            );
            $logicJumpCondition = (new MultipleChoiceQuestionLogicJumpCondition())
                ->setValue($choiceValue)
                ->setOperator($operator)
                ->setQuestion($jumpQuestion)
                ->setPosition($conditionIndex)
                ->setJump($jump);
            $this->em->persist($logicJumpCondition);
        }
    }

    private function addDestination(
        Questionnaire $questionnaire,
        string $destinationTitle,
        LogicJump $jump
    ): void {
        $destination = $this->abstractQuestionRepository->findOneByQuestionnaireAndTitle(
            $questionnaire,
            $destinationTitle
        );
        $jump->setDestination($destination);
    }

    private function addOrigin(
        Questionnaire $questionnaire,
        string $originTitle,
        LogicJump $jump
    ): void {
        $origin = $this->abstractQuestionRepository->findOneByQuestionnaireAndTitle(
            $questionnaire,
            $originTitle
        );
        $jump->setOrigin($origin);
    }
}
