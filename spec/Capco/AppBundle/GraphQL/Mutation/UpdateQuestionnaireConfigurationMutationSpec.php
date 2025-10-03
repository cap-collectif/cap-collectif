<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\QuestionnaireConfigurationUpdateType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateQuestionnaireConfigurationMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\QuestionJumpsHandler;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;
use Capco\AppBundle\Repository\QuestionnaireAbstractQuestionRepository;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateQuestionnaireConfigurationMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
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
        QuestionJumpsHandler $questionJumpsHandler,
        ActionLogger $actionLogger
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $globalIdResolver,
            $questionRepo,
            $abstractQuestionRepo,
            $choiceQuestionRepository,
            $logger,
            $indexer,
            $colorValidator,
            $authorizationChecker,
            $questionJumpsHandler,
            $actionLogger
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateQuestionnaireConfigurationMutation::class);
    }

    public function it_should_update_correctly(
        Arg $input,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        QuestionnaireStep $step,
        Project $project,
        FormFactoryInterface $formFactory,
        FormInterface $form,
        EntityManagerInterface $em,
        ActionLogger $actionLogger
    ) {
        $arguments = [
            'questionnaireId' => 'abc',
            'title' => 'abc',
        ];

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->getArrayCopy()->willReturn($arguments);

        $globalIdResolver
            ->resolve($arguments['questionnaireId'], $viewer)
            ->willReturn($questionnaire)
        ;
        $questionnaire->getId()->willReturn('abc');
        $questionnaire->getType()->willReturn('Questionnaire');
        $questionnaire->getTitle()->willReturn('abc');
        $project->getTitle()->willReturn('Mon projet');
        $step->getProject()->willReturn($project);
        $questionnaire->getStep()->willReturn($step);
        $arguments = ['title' => 'abc'];

        $questionnaire->setUpdatedAt(Argument::type(\DateTime::class))->shouldBeCalled();

        $formFactory
            ->create(QuestionnaireConfigurationUpdateType::class, $questionnaire)
            ->willReturn($form)
        ;
        $form->submit($arguments, false)->shouldBeCalled();
        $form->isValid()->willReturn(true);

        $em->flush()->shouldBeCalled();

        $actionLogger->logGraphQLMutation(Argument::any(), Argument::any(), Argument::any(), Argument::any(), Argument::any())->willReturn(true);

        $this->__invoke($input, $viewer)->shouldReturn([
            'questionnaire' => $questionnaire,
        ]);
    }

    public function it_should_throw_exception_on_invalid_form(
        Arg $input,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        Questionnaire $questionnaire,
        FormFactoryInterface $formFactory,
        FormInterface $form,
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FormErrorIterator $formErrorIterator
    ) {
        $arguments = [
            'questionnaireId' => 'abc',
            'title' => 'abc',
        ];

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->getArrayCopy()->willReturn($arguments);
        $globalIdResolver
            ->resolve($arguments['questionnaireId'], $viewer)
            ->willReturn($questionnaire)
        ;

        $arguments = ['title' => 'abc'];
        $questionnaire->getId()->willReturn('abc');
        $questionnaire
            ->setUpdatedAt(Argument::type(\DateTime::class))
            ->shouldBeCalled()
            ->willReturn($questionnaire)
        ;

        $formFactory
            ->create(QuestionnaireConfigurationUpdateType::class, $questionnaire)
            ->willReturn($form)
        ;
        $form->submit($arguments, false)->shouldBeCalled();
        $form->isValid()->willReturn(false);

        $form->getErrors(true, false)->willReturn($formErrorIterator);
        $formErrorIterator->__toString()->willReturn('abc');
        $logger->error(Argument::any())->shouldBeCalled();

        $form->all()->willReturn([]);
        $form->getErrors()->willReturn([]);

        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(GraphQLException::class)->during('__invoke', [$input, $viewer]);
    }

    public function it_should_return_false_if_questionnaire_is_not_found(
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $id = 'abc';
        $questionnaire = null;
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);
        $authorizationChecker
            ->isGranted(QuestionnaireVoter::EDIT, $questionnaire)
            ->shouldNotBeCalled()
        ;

        $this->isGranted($id, $viewer)->shouldReturn(false);
    }

    public function it_should_call_is_granted_if_questionnaire_is_found(
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AuthorizationCheckerInterface $authorizationChecker,
        Questionnaire $questionnaire
    ) {
        $id = 'abc';
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);
        $authorizationChecker
            ->isGranted(QuestionnaireVoter::EDIT, $questionnaire)
            ->willReturn(true)
            ->shouldBeCalled()
        ;

        $this->isGranted($id, $viewer);
    }
}
