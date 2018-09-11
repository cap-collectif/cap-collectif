<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Form\ProposalFormUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
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

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        ProposalFormRepository $proposalFormRepo,
        LoggerInterface $logger,
        QuestionnaireAbstractQuestionRepository $questionRepo
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->proposalFormRepo = $proposalFormRepo;
        $this->logger = $logger;
        $this->questionRepo = $questionRepo;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $id = $arguments['proposalFormId'];

        $proposalForm = $this->proposalFormRepo->find($id);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form with id "%s"', $id));
        }
        unset($arguments['proposalFormId']);

        $form = $this->formFactory->create(ProposalFormUpdateType::class, $proposalForm);

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
            foreach ($arguments['questions'] as $key => &$argument) {
                //we are updating a question
                if (isset($argument['question']['id'])) {
                    $questionsOrderedById[] = $argument['question']['id'];
                } else {
                    //creating a question
                    $questionsOrderedById[] = $argument['question']['title'];
                }
            }

            // we must reorder arguments datas to match database order (used in the symfony form)
            usort($arguments['questions'], function ($a, $b) use ($questionsOrderedByIdInDb) {
                if (isset($a['question']['id'], $b['question']['id'])) {
                    return (
                        array_search($a['question']['id'], $questionsOrderedByIdInDb) >
                        array_search($b['question']['id'], $questionsOrderedByIdInDb)
                    );
                }
                //respect the user order, for now we just put new items at the end
                return isset($a['question']['id']) ? false : true;
            });

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
