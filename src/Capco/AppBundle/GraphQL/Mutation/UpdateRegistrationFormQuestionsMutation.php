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
            $this->handleQuestions($form, $registrationForm, $arguments, 'registration');
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
