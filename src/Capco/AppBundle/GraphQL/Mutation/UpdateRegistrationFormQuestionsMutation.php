<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\RegistrationFormQuestionsUpdateType;
use Capco\AppBundle\GraphQL\Traits\QuestionPersisterTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateRegistrationFormQuestionsMutation implements MutationInterface
{
    use QuestionPersisterTrait;

    private $em;
    private $registrationFormRepository;
    private $formFactory;
    private $questionRepo;
    private $abstractQuestionRepo;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        RegistrationFormRepository $registrationFormRepository,
        QuestionnaireAbstractQuestionRepository $questionRepo,
        AbstractQuestionRepository $abstractQuestionRepo
    ) {
        $this->em = $em;
        $this->registrationFormRepository = $registrationFormRepository;
        $this->questionRepo = $questionRepo;
        $this->abstractQuestionRepo = $abstractQuestionRepo;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $registrationForm = $this->registrationFormRepository->findCurrent();

        if ($registrationForm) {
            $form = $this->formFactory->create(
                RegistrationFormQuestionsUpdateType::class,
                $registrationForm
            );

            $questionsOrderedByBase = $registrationForm->getRealQuestions()->toArray();

            $this->handleQuestions(
                $questionsOrderedByBase,
                $arguments,
                $dataQuestion,
                $registrationForm,
                $questionsOrderedById
            );
            $form->submit($arguments, false);
            $this->handleQuestionsPersisting($registrationForm, $questionsOrderedById);

            $this->em->flush();

            return compact('registrationForm');
        }
    }
}
