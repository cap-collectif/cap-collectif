<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProposalFormMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private $em;
    private $formFactory;
    private $proposalFormRepo;
    private $logger;
    private $questionRepo;
    private $abstractQuestionRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        ProposalFormRepository $proposalFormRepo,
        LoggerInterface $logger,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalFormRepo = $proposalFormRepo;
        $this->logger = $logger;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['proposalFormId'];

        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepo->find($id);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%s"', $id));
        }
        unset($arguments['proposalFormId']);

        $form = $this->formFactory->create(ProposalFormUpdateType::class, $proposalForm);

        if (isset($arguments['districts'])) {
            $districtsIds = [];
            foreach ($arguments['districts'] as $dataDistrict) {
                if (isset($dataDistrict['id'])) {
                    $districtsIds[] = $dataDistrict['id'];
                }
            }

            foreach ($proposalForm->getDistricts() as $position => $district) {
                if (!in_array($district->getId(), $districtsIds)) {
                    $deletedDistrict = [
                        'id' => $district->getId(),
                        'name' => "NULL",
                    ];
                    array_splice($arguments['districts'], $position, 0, [$deletedDistrict]);
                }
            }
        }

        if (isset($arguments['categories'])) {
            $categoriesIds = [];
            foreach ($arguments['categories'] as $dataCategory) {
                if (isset($dataCategory['id'])) {
                    $categoriesIds[] = $dataCategory['id'];
                }
            }

            foreach ($proposalForm->getCategories() as $position => $category) {
                if (!in_array($category->getId(), $categoriesIds)) {
                    $deletedCategory = [
                        'id' => $category->getId(),
                        'name' => "NULL",
                    ];
                    // Add deleted category.
                    array_splice($arguments['categories'], $position, 0, [$deletedCategory]);
                }
            }
        }

        if (isset($arguments['questions'])) {
            $questionsOrderedByBase = $form->getData()->getRealQuestions();

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
                //respect the user order, for now we just put new items at the end
                return isset($a['question']['id']) ? false : true;
            });

            foreach ($proposalForm->getQuestions() as $position => $proposalFormQuestion) {
                if (
                    !in_array($proposalFormQuestion->getQuestion()->getId(), $argumentsQuestionsId)
                ) {
                    // Put the title to null to be delete from delete_empty CollectionType field
                    $deletedQuestion = [
                        'question' => [
                            'id' => $proposalFormQuestion->getQuestion()->getId(),
                            'type' => $proposalFormQuestion->getQuestion()->getType(),
                            'title' => null,
                        ],
                    ];
                    // Inject back the deleted question into the arguments question array
                    array_splice($arguments['questions'], $position, 0, [$deletedQuestion]);
                }
            }
            $form->submit($arguments, false);
            $qaq = $proposalForm->getQuestions();

            // We make sure a question position by questionnaire is unique
            $delta =
                $this->questionRepo->getCurrentMaxPositionForProposalForm($proposalForm->getId()) +
                1;

            $this->persistQuestion($qaq, $this->em, $delta, $questionsOrderedById);
        } else {
            $form->submit($arguments, false);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['proposalForm' => $proposalForm];
    }
}
