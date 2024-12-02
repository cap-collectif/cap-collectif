<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\QuestionsInterface;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class QuestionJumpsHandler
{
    use QuestionPersisterTrait;
    private readonly EntityManagerInterface $em;
    private readonly AbstractQuestionRepository $abstractQuestionRepo;
    private readonly QuestionnaireAbstractQuestionRepository $questionRepo;
    private readonly LoggerInterface $logger;
    private readonly ValidatorInterface $colorValidator;
    private readonly MultipleChoiceQuestionRepository $choiceQuestionRepository;
    private readonly Indexer $indexer;

    public function __construct(
        private readonly QuestionChoiceRepository $questionChoiceRepository,
        private readonly AbstractQuestionRepository $questionRepository,
        private readonly FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        AbstractQuestionRepository $abstractQuestionRepo,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        LoggerInterface $logger,
        ValidatorInterface $colorValidator,
        MultipleChoiceQuestionRepository $choiceQuestionRepository,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->questionRepo = $questionRepo;
        $this->logger = $logger;
        $this->colorValidator = $colorValidator;
        $this->choiceQuestionRepository = $choiceQuestionRepository;
        $this->indexer = $indexer;
    }

    /**
     * @param array<string, mixed> $arguments
     */
    public function saveJumps(array $arguments, QuestionsInterface $entity): void
    {
        ['formType' => $formType, 'type' => $type] = $this->getEntityConfig($entity, $arguments);

        $questions = $arguments['questions'] ?? null;

        if (!$questions) {
            return;
        }

        if (!$this->hasJumps($questions)) {
            return;
        }

        $this->parseTemporaryId($arguments['questions']);

        $this->em->refresh($entity);

        $form = $this->formFactory->create($formType, $entity);

        $this->handleQuestions($form, $entity, $arguments, $type);

        // we need to reset temporaryId, so we can reuse the same questions in proposal form and questionnaire steps model
        foreach ($entity->getQuestions() as $qaq) {
            $question = $qaq->getQuestion();
            $question->setTemporaryId(null);
            if ($question instanceof MultipleChoiceQuestion) {
                foreach ($question->getChoices() as $choice) {
                    $choice->setTemporaryId(null);
                }
            }
        }

        $this->em->flush();
    }

    public function unsetJumps(array &$questionnaire): void
    {
        if (empty($questionnaire['questions'])) {
            return;
        }

        foreach ($questionnaire['questions'] as &$questionData) {
            unset($questionData['question']['alwaysJumpDestinationQuestion']);
            if (!empty($questionData['question']['jumps'])) {
                unset($questionData['question']['jumps']);
            }
        }
    }

    /**
     * @param array<mixed> $questions
     */
    private function hasJumps(array $questions): bool
    {
        foreach ($questions as &$questionData) {
            if ($questionData['question']['alwaysJumpDestinationQuestion'] ?? null) {
                return true;
            }

            if ($questionData['question']['jumps'] ?? null) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<string, string> $arguments
     *
     * @return string[]
     */
    private function getEntityConfig(QuestionsInterface $entity, array &$arguments): array
    {
        $isQuestionnaire = true === $entity instanceof Questionnaire;
        $isProposalForm = true === $entity instanceof ProposalForm;

        if (!$isQuestionnaire && !$isProposalForm) {
            throw new UserError('Given entity should be either of type Questionnaire or ProposalForm');
        }

        $formType = $isQuestionnaire ? QuestionnaireConfigurationUpdateType::class : ProposalFormUpdateType::class;
        $type = $isQuestionnaire ? 'questionnaire' : 'proposalForm';

        if ($isQuestionnaire && $arguments['questionnaireId']) {
            unset($arguments['questionnaireId']);
        } else {
            unset($arguments['proposalFormId']);
        }

        return ['formType' => $formType, 'type' => $type];
    }

    private function parseTemporaryId(array &$questions)
    {
        foreach ($questions as &$questionData) {
            $questionTempId = $questionData['question']['temporaryId'] ?? null;
            $questionId = $questionData['question']['id'] ?? null;

            if ($questionTempId && !$questionId) {
                $questionData['question']['id'] = $this->getQuestionGlobalId($questionTempId);
            }

            if ($questionData['question']['choices'] ?? null) {
                foreach ($questionData['question']['choices'] as &$choice) {
                    $tempId = $choice['temporaryId'] ?? null;
                    if ($tempId) {
                        $choice['id'] = $this->getQuestionChoiceGlobalId($tempId);
                        unset($choice['temporaryId']);
                    }
                }
            }

            $alwaysJumpDestinationQuestion = $questionData['question']['alwaysJumpDestinationQuestion'] ?? null;
            if ($alwaysJumpDestinationQuestion) {
                $questionData['question']['alwaysJumpDestinationQuestion'] = $this->getQuestionGlobalId($alwaysJumpDestinationQuestion);
            }

            $jumps = $questionData['question']['jumps'] ?? null;
            if ($jumps) {
                foreach ($questionData['question']['jumps'] as &$jump) {
                    $origin = $jump['origin'];
                    if ($origin) {
                        $jump['origin'] = $this->getQuestionGlobalId($origin);
                    }
                    $destination = $jump['destination'];
                    if ($destination) {
                        $jump['destination'] = $this->getQuestionGlobalId($destination);
                    }
                    foreach ($jump['conditions'] as &$condition) {
                        $conditionQuestion = $condition['question'];
                        if ($conditionQuestion) {
                            $condition['question'] = $this->getQuestionGlobalId($conditionQuestion);
                        }
                        $value = $condition['value'];
                        if ($value) {
                            $condition['value'] = $this->getQuestionChoiceGlobalId($value);
                        }
                    }
                }
            }
        }
    }

    private function getQuestionChoiceGlobalId(string $questionChoiceId): string
    {
        $isGlobalId = (bool) GlobalId::fromGlobalId($questionChoiceId)['type'];

        if ($isGlobalId) {
            return $questionChoiceId;
        }

        $questionChoice = $this->questionChoiceRepository->findOneBy(['temporaryId' => $questionChoiceId]);

        if (!$questionChoice instanceof QuestionChoice) {
            throw new \Exception("question choice with id : {$questionChoiceId} was not found");
        }

        return GlobalId::toGlobalId('QuestionChoice', $questionChoice->getId());
    }

    private function getQuestionGlobalId(string $questionId): string
    {
        $isGlobalId = (bool) GlobalId::fromGlobalId($questionId)['type'];

        if ($isGlobalId) {
            return $questionId;
        }

        $question = $this->questionRepository->findOneBy(['temporaryId' => $questionId]);

        if (!$question instanceof AbstractQuestion) {
            throw new \Exception("question with id : {$questionId} was not found");
        }

        return GlobalId::toGlobalId('Question', $question->getId());
    }
}
