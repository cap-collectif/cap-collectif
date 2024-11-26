<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Helper\QuestionJumpsHandler;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateQuestionnaireConfigurationMutation implements MutationInterface
{
    use MutationTrait;
    use QuestionPersisterTrait;

    private readonly EntityManagerInterface $em;
    private readonly FormFactoryInterface $formFactory;
    private readonly LoggerInterface $logger;
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly GlobalIdResolver $globalIdResolver;

    /** used in QuestionPersisterTrait */
    private readonly QuestionnaireAbstractQuestionRepository $questionRepo;
    private readonly AbstractQuestionRepository $abstractQuestionRepo;
    private readonly Indexer $indexer;
    private readonly MultipleChoiceQuestionRepository $choiceQuestionRepository;
    private readonly ValidatorInterface $colorValidator;
    private readonly QuestionJumpsHandler $questionJumpsHandler;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo,
        MultipleChoiceQuestionRepository $choiceQuestionRepository,
        LoggerInterface $logger,
        Indexer $indexer,
        ValidatorInterface $colorValidator,
        AuthorizationCheckerInterface $authorizationChecker,
        QuestionJumpsHandler $questionJumpsHandler
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->logger = $logger;
        $this->indexer = $indexer;
        $this->colorValidator = $colorValidator;
        $this->choiceQuestionRepository = $choiceQuestionRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->globalIdResolver = $globalIdResolver;
        $this->questionJumpsHandler = $questionJumpsHandler;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        // we remove jumps from this array to handle it later when questions are already saved
        $this->questionJumpsHandler->unsetJumps($arguments);

        $questionnaire = $this->getQuestionnaire($arguments['questionnaireId'], $viewer);
        $oldChoices = null;
        unset($arguments['questionnaireId']);

        $questionnaire->setUpdatedAt(new \Datetime());

        $form = $this->formFactory->create(
            QuestionnaireConfigurationUpdateType::class,
            $questionnaire
        );

        if (isset($arguments['questions'])) {
            $oldChoices = $this->getQuestionChoicesValues($questionnaire->getId());
            $this->handleQuestions($form, $questionnaire, $arguments, 'questionnaire');
        } else {
            $form->submit($arguments, false);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . $form->getErrors(true, false)->__toString());

            throw GraphQLException::fromFormErrors($form);
        }
        $this->em->flush();

        $this->questionJumpsHandler->saveJumps($input->getArrayCopy(), $questionnaire);
        $this->reIndex($oldChoices, $questionnaire->getId());

        return ['questionnaire' => $questionnaire];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if ($questionnaire instanceof Questionnaire) {
            return $this->authorizationChecker->isGranted(QuestionnaireVoter::EDIT, $questionnaire);
        }

        return false;
    }

    private function getQuestionnaire($questionnaireId, $viewer): Questionnaire
    {
        $questionnaire = $this->globalIdResolver->resolve($questionnaireId, $viewer);
        if (!$questionnaire instanceof Questionnaire) {
            throw new UserError('Questionnaire not found.');
        }

        return $questionnaire;
    }

    private function reIndex(?array $oldChoices, string $questionnaireId): void
    {
        if (isset($oldChoices)) {
            // We index all the question choices synchronously to avoid a
            // difference between datas saved in db and in elasticsearch.
            $newChoices = $this->getQuestionChoicesValues($questionnaireId);
            $mergedChoices = array_unique(array_merge($oldChoices, $newChoices));
            if (\count($mergedChoices) < 1500) {
                $this->indexQuestionChoicesValues($mergedChoices);
            }
        }
    }
}
