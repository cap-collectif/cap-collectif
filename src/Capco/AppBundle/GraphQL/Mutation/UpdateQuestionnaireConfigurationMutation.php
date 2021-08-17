<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateQuestionnaireConfigurationMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private AuthorizationCheckerInterface $authorizationChecker;
    private GlobalIdResolver $globalIdResolver;

    /** used in QuestionPersisterTrait */
    private QuestionnaireAbstractQuestionRepository $questionRepo;
    private AbstractQuestionRepository $abstractQuestionRepo;
    private Indexer $indexer;
    private MultipleChoiceQuestionRepository $choiceQuestionRepository;
    private ValidatorInterface $colorValidator;

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
        AuthorizationCheckerInterface $authorizationChecker
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
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getArrayCopy();
        $questionnaireId = GlobalId::fromGlobalId($arguments['questionnaireId'])['id'];
        $questionnaire = $this->globalIdResolver->resolve($arguments['questionnaireId'], $viewer);

        unset($arguments['questionnaireId']);

        $questionnaire->setUpdatedAt(new \Datetime());

        $form = $this->formFactory->create(
            QuestionnaireConfigurationUpdateType::class,
            $questionnaire
        );

        if (isset($arguments['questions'])) {
            $oldChoices = $this->getQuestionChoicesValues($questionnaireId);
            $this->handleQuestions($form, $questionnaire, $arguments, 'questionnaire');
        } else {
            $form->submit($arguments, false);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . $form->getErrors(true, false)->__toString());

            throw GraphQLException::fromFormErrors($form);
        }
        $this->em->flush();

        if (isset($oldChoices)) {
            // We index all the question choices synchronously to avoid a
            // difference between datas saved in db and in elasticsearch.
            $newChoices = $this->getQuestionChoicesValues($questionnaireId);
            $mergedChoices = array_unique(array_merge($oldChoices, $newChoices));
            if (\count($mergedChoices) < 1500) {
                $this->indexQuestionChoicesValues($mergedChoices);
            }
        }

        return ['questionnaire' => $questionnaire];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if ($questionnaire) {
            return $this->authorizationChecker->isGranted(QuestionnaireVoter::EDIT, $questionnaire);
        }

        return false;
    }
}
