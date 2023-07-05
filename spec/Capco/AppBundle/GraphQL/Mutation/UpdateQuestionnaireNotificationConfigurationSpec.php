<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\QuestionnaireNotificationConfigurationType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\UpdateQuestionnaireNotificationConfiguration;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateQuestionnaireNotificationConfigurationSpec extends ObjectBehavior
{
    public function let(
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith(
            $globalIdResolver,
            $formFactory,
            $em,
            $authorizationChecker,
            $logger
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateQuestionnaireNotificationConfiguration::class);
    }

    public function it_should_update_notification_configuration(
        Arg $arguments,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        Questionnaire $questionnaire,
        QuestionnaireNotificationConfiguration $notificationConfiguration
    ) {
        $data = [
            'email' => 'test@capco.com',
            'onQuestionnaireReplyCreate' => true,
            'onQuestionnaireReplyUpdate' => true,
            'onQuestionnaireReplyDelete' => true,
        ];
        $questionnaireId = 'abc';

        $arguments->getArrayCopy()->willReturn($data);
        $arguments->offsetGet('questionnaireId')->willReturn($questionnaireId);

        $globalIdResolver->resolve($questionnaireId, $viewer)->willReturn($questionnaire);
        $questionnaire->getNotificationsConfiguration()->willReturn($notificationConfiguration);

        $formFactory
            ->create(QuestionnaireNotificationConfigurationType::class, $notificationConfiguration)
            ->willReturn($form)
        ;
        $form->submit($data, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'questionnaire' => $questionnaire,
        ]);
    }

    public function it_should_throw_exception_if_form_is_not_valid(
        Arg $arguments,
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Form $form,
        EntityManagerInterface $em,
        Questionnaire $questionnaire,
        QuestionnaireNotificationConfiguration $notificationConfiguration,
        LoggerInterface $logger,
        FormErrorIterator $formErrorIterator
    ) {
        $data = [
            'email' => 'test@capco.com',
            'onQuestionnaireReplyCreate' => true,
            'onQuestionnaireReplyUpdate' => true,
            'onQuestionnaireReplyDelete' => true,
        ];
        $questionnaireId = 'abc';

        $arguments->getArrayCopy()->willReturn($data);
        $arguments->offsetGet('questionnaireId')->willReturn($questionnaireId);

        $globalIdResolver->resolve($questionnaireId, $viewer)->willReturn($questionnaire);
        $questionnaire->getNotificationsConfiguration()->willReturn($notificationConfiguration);

        $formFactory
            ->create(QuestionnaireNotificationConfigurationType::class, $notificationConfiguration)
            ->willReturn($form)
        ;
        $form->submit($data, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $em->flush()->shouldNotBeCalled();

        $form->getErrors(true, false)->willReturn($formErrorIterator);
        $formErrorIterator->__toString()->willReturn('abc');
        $logger->error(Argument::any())->shouldBeCalled();

        $form->all()->willReturn([]);
        $form->getErrors()->willReturn([]);

        $this->shouldThrow(GraphQLException::class)->during('__invoke', [$arguments, $viewer]);
    }

    public function it_should_return_false_if_questionnaire_is_not_found(
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AuthorizationChecker $authorizationChecker
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
        AuthorizationChecker $authorizationChecker,
        Questionnaire $questionnaire
    ) {
        $id = 'abc';
        $globalIdResolver->resolve($id, $viewer)->willReturn($questionnaire);

        $authorizationChecker
            ->isGranted(QuestionnaireVoter::EDIT, $questionnaire)
            ->shouldBeCalled()
        ;

        $this->isGranted($id, $viewer);
    }
}
