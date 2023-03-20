<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\LogicJumpRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionLogicJumpConditionRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateJumpsMutation implements MutationInterface
{
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;
    private LogicJumpRepository $logicJumpRepository;
    private MultipleChoiceQuestionLogicJumpConditionRepository $multipleChoiceQuestionLogicJumpConditionRepository;
    private QuestionnaireRepository $questionnaireRepository;
    private AbstractQuestionRepository $questionRepository;
    private QuestionChoiceRepository $questionChoiceRepository;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        LogicJumpRepository $logicJumpRepository,
        MultipleChoiceQuestionLogicJumpConditionRepository $multipleChoiceQuestionLogicJumpConditionRepository,
        QuestionnaireRepository $questionnaireRepository,
        AbstractQuestionRepository $questionRepository,
        QuestionChoiceRepository $questionChoiceRepository
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->logicJumpRepository = $logicJumpRepository;
        $this->multipleChoiceQuestionLogicJumpConditionRepository = $multipleChoiceQuestionLogicJumpConditionRepository;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->questionRepository = $questionRepository;
        $this->questionChoiceRepository = $questionChoiceRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {

        $questionnaireId = $input->offsetGet('questionnaireId');
        $questionsJumps = $input->offsetGet('questionsJumps');

        /** * @var $questionnaire Questionnaire  */
        $questionnaire = $this->questionnaireRepository->find($questionnaireId);

        foreach ($questionsJumps as $question) {
            $originId = $question['questionId'];
            $origin = $this->getQuestion($originId, $viewer);
            if ($origin instanceof MultipleChoiceQuestion === false) {
                throw new UserError("Origin question with id {$originId} should be an instance of MultipleChoiceQuestion");
            }

            if ($question['alwaysJumpDestinationQuestion'] ?? null) {
                $alwaysJumpDestinationQuestion = $this->getQuestion($question['alwaysJumpDestinationQuestion'], $viewer);
                $origin->setAlwaysJumpDestinationQuestion($alwaysJumpDestinationQuestion);
            }

            $jumps = $question['jumps'];
            $this->updateJumps($jumps, $origin, $viewer);
        }

        $this->em->flush();

        $questions = $questionnaire->getRealQuestions();
        return ['questions' => $questions];
    }

    private function updateJumps(array $jumps, MultipleChoiceQuestion $origin, User $viewer)
    {
        foreach ($jumps as $index => $jumpInput) {
            $jumpId = $jumpInput['id'] ?? null;
            $jump = $this->getJump($jumpId);

            $this->removeOrphanConditions($jump, $jumpInput['conditions']);

            $destination = $this->getQuestion($jumpInput['destination'], $viewer);

            $this->updateConditions($jumpInput['conditions'], $viewer, $jump);

            $jump->setOrigin($origin)
                 ->setDestination($destination)
                 ->setPosition($index);
        }

        $this->removeOrphanJumps($origin, $jumps);
    }

    private function removeOrphanConditions(LogicJump $jump, array $conditionsInput)
    {
        $updatedConditionsIds = [];
        foreach ($conditionsInput as $conditionInput) {
            $id = $conditionInput['id'] ?? null;
            if (!$id) {
                continue;
            }
            $updatedConditionsIds[] = $id;
        }

        if (empty($updatedConditionsIds)) {
            return;
        }

        $existingConditions = $jump->getConditions();

        foreach ($existingConditions as $existingCondition) {
            if (!in_array($existingCondition->getId(), $updatedConditionsIds)) {
                $jump->removeCondition($existingCondition);
            }
        }
    }

    private function updateConditions(array $conditions, User $viewer, LogicJump $jump)
    {
        foreach ($conditions as $index => $conditionInput) {
            ['operator' => $operator, 'question' => $questionId, 'value' => $questionChoiceId] = $conditionInput;
            $id = $conditionInput['id'] ?? null;

            $condition = $id ? $this->multipleChoiceQuestionLogicJumpConditionRepository->find($id)
                : new MultipleChoiceQuestionLogicJumpCondition();

            $question = $this->getQuestion($questionId, $viewer);
            $questionChoice = $this->getQuestionChoice($questionChoiceId, $viewer);

            $condition->setOperator($operator)
                      ->setQuestion($question)
                      ->setValue($questionChoice)
                      ->setPosition($index);

            if ($condition->getId() === null) {
                $jump->addCondition($condition);
                $this->em->persist($condition);
                $this->em->persist($jump);
            }
        }
    }

    public function removeOrphanJumps(MultipleChoiceQuestion $origin, array $jumps)
    {
        $existingJumps = $origin->getJumps();
        $newJumpsIds = array_map(function ($jump) {
            return $jump['id'] ?? null;
        }, $jumps);

        foreach ($existingJumps as $jump) {
            $existingJumpBelongsToUpdatedJumps = in_array($jump->getId(), $newJumpsIds);
            if (!$existingJumpBelongsToUpdatedJumps) {
                $this->em->remove($jump);
            }
        }
    }

    private function getQuestionChoice(string $questionChoiceId, User $viewer): QuestionChoice
    {
        $isGlobalId = !!GlobalId::fromGlobalId($questionChoiceId)['type'];

        if (!$isGlobalId) {
            $questionChoice = $this->questionChoiceRepository->findOneBy(['temporaryId' => $questionChoiceId]);
        } else {
            $questionChoice = $this->globalIdResolver->resolve($questionChoiceId, $viewer);
        }

        if (!$questionChoice instanceof QuestionChoice) {
            throw new \Exception("question choice with id : {$questionChoiceId} was not found");
        }

        return $questionChoice;
    }

    private function getQuestion(string $questionId, User $viewer): AbstractQuestion
    {
        $isGlobalId = !!GlobalId::fromGlobalId($questionId)['type'];

        if (!$isGlobalId) {
            $question = $this->questionRepository->findOneBy(['temporaryId' => $questionId]);
        } else {
            $question = $this->globalIdResolver->resolve($questionId, $viewer);
        }

        if (!$question instanceof AbstractQuestion) {
            throw new \Exception("question with id : {$questionId} was not found");
        }

        return $question;
    }

    private function getJump(?string $id): LogicJump
    {
        return $id ? $this->logicJumpRepository->find($id) : new LogicJump();
    }

    public function isGranted(string $questionnaireId): bool
    {
        $questionnaire = $this->questionnaireRepository->find($questionnaireId);

        if (!$questionnaire instanceof Questionnaire) {
            return false;
        }

        return $this->authorizationChecker->isGranted(QuestionnaireVoter::EDIT, $questionnaire);
    }

}
