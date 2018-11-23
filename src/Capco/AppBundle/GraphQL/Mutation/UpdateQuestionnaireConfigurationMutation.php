<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\LogicJump;
use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Repository\LogicJumpRepository;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Repository\AbstractLogicJumpConditionRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;

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

        $questionnaireId = GlobalId::fromGlobalId($arguments['questionnaireId'])['id'];
        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->questionnaireRepository->find($questionnaireId);

        if (!$questionnaire) {
            throw new UserError(sprintf('Unknown questionnaire with id "%s"', $questionnaireId));
        }
        unset($arguments['questionnaireId']);

        $form = $this->formFactory->create(
            QuestionnaireConfigurationUpdateType::class,
            $questionnaire
        );

        if (isset($arguments['questions'])) {
            $this->handleQuestions($form, $questionnaire, $arguments, 'questionnaire');
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
