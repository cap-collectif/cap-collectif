<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractLogicJumpConditionRepository;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\LogicJumpRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\PersistentCollection;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateQuestionnaireConfigurationMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private $em;
    private $formFactory;
    private $questionnaireRepository;
    private $questionRepo;
    private $abstractQuestionRepo;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        QuestionnaireRepository $questionnaireRepository,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['questionnaireId'];
        $questionnaire = $this->questionnaireRepository->find($id);

        if (!$questionnaire) {
            throw new UserError(sprintf('Unknown questionnaire with id "%s"', $id));
        }
        unset($arguments['questionnaireId']);
        $form = $this->formFactory->create(
            QuestionnaireConfigurationUpdateType::class,
            $questionnaire
        );

        if (isset($arguments['questions'])) {
            $questionsOrderedByBase = $form
                ->getData()
                ->getRealQuestions()
                ->toArray();

            $questionsOrderedByIdInDb = [];
            foreach ($questionsOrderedByBase as $question) {
                $questionsOrderedByIdInDb[] = $question->getId();
            }

            //we stock the order sent to apply it after
            $questionsOrderedById = [];
            // We need an array of questions ids from arguments
            $argumentsQuestionsId = [];
            foreach ($arguments['questions'] as $key => &$dataQuestion) {
                //we are updating a question
                if (isset($dataQuestion['question']['id'])) {
                    $dataQuestionId = $dataQuestion['question']['id'];
                    $questionsOrderedById[] = $dataQuestionId;
                    $argumentsQuestionsId[] = $dataQuestionId;

                    $abstractQuestion = $this->abstractQuestionRepo->find($dataQuestionId);
                    // If it's not a multiple choice question
                    if (!$abstractQuestion instanceof MultipleChoiceQuestion) {
                        continue;
                    }

                    $dataQuestionChoicesIds = [];
                    foreach (
                        $dataQuestion['question']['questionChoices']
                        as $key => $dataQuestionChoice
                    ) {
                        if (isset($dataQuestionChoice['id'])) {
                            $dataQuestionChoicesIds[] = $dataQuestionChoice['id'];
                        }
                    }

                    foreach (
                        $abstractQuestion->getQuestionChoices()
                        as $position => $questionChoice
                    ) {
                        if (!in_array($questionChoice->getId(), $dataQuestionChoicesIds)) {
                            $deletedChoice = [
                                'id' => $abstractQuestion->getId(),
                                'title' => null,
                            ];
                            array_splice(
                                $dataQuestion['question']['questionChoices'],
                                $position,
                                0,
                                [$deletedChoice]
                            );
                        }
                    }
                } else {
                    //creating a question
                    $questionsOrderedById[] = $dataQuestion['question']['title'];
                }
            }

            // we must reorder arguments datas to match database order (used in the symfony form)
            usort($arguments['questions'], function ($a, $b) use ($questionsOrderedByIdInDb) {
                if (isset($a['question']['id'], $b['question']['id'])) {
                    return array_search($a['question']['id'], $questionsOrderedByIdInDb) >
                        array_search($b['question']['id'], $questionsOrderedByIdInDb);
                }
                //@todo respect the user order, for now we just put new items at the end
                return isset($a['question']['id']) ? false : true;
            });

            foreach ($questionnaire->getQuestions() as $position => $questionnaireQuestion) {
                if (
                    !in_array($questionnaireQuestion->getQuestion()->getId(), $argumentsQuestionsId)
                ) {
                    // Put the title to null to be delete from delete_empty CollectionType field
                    $deletedQuestion = [
                        'question' => [
                            'id' => $questionnaireQuestion->getQuestion()->getId(),
                            'type' => $questionnaireQuestion->getQuestion()->getType(),
                            'title' => null,
                        ],
                    ];
                    // Inject back the deleted question into the arguments question array
                    array_splice($arguments['questions'], $position, 0, [$deletedQuestion]);
                }
            }

            $form->submit($arguments, false);
            $qaq = $questionnaire->getQuestions();
            // We make sure a question position by questionnaire is unique
            $delta =
                $this->questionRepo->getCurrentMaxPositionForQuestionnaire(
                    $questionnaire->getId()
                ) + 1;
            $this->persistQuestion($qaq, $this->em, $delta, $questionsOrderedById);
        } else {
            $form->submit($arguments, false);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));
            throw GraphQLException::fromFormErrors($form);
        }
        $this->em->flush();

        return ['questionnaire' => $questionnaire];
    }
}
