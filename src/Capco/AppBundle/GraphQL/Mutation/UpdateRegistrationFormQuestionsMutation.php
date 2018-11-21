<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Form\RegistrationFormQuestionsUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateRegistrationFormQuestionsMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private $em;
    private $formFactory;
    private $registrationFormRepository;
    private $logger;
    private $questionRepo;
    private $abstractQuestionRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        RegistrationFormRepository $registrationFormRepository,
        LoggerInterface $logger,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->registrationFormRepository = $registrationFormRepository;
        $this->logger = $logger;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();

        $registrationForm = $this->registrationFormRepository->findCurrent();

        if (!$registrationForm) {
            throw new UserError("No registration form");
        }

        $form = $this->formFactory->create(
            RegistrationFormQuestionsUpdateType::class,
            $registrationForm
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
                //respect the user order, for now we just put new items at the end
                return isset($a['question']['id']) ? false : true;
            });

            foreach ($registrationForm->getQuestions() as $position => $proposalFormQuestion) {
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
            $qaq = $registrationForm->getQuestions();

            // We make sure a question position by questionnaire is unique
            $delta =
                $this->questionRepo->getCurrentMaxPositionForRegistrationForm(
                    $registrationForm->getId()
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

        return compact('registrationForm');
    }
}
