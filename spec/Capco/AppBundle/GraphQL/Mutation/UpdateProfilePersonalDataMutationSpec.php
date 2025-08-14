<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Mutation\UpdateProfilePersonalDataMutation;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\PersonalDataFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;

class UpdateProfilePersonalDataMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository
    ) {
        $this->beConstructedWith($em, $formFactory, $logger, $userRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateProfilePersonalDataMutation::class);
    }

    public function it_update_myself_and_viewer_is_admin(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form
    ) {
        $arguments->offsetGet('stepId')->willReturn('stepId');

        $viewer->getUsername()->willReturn('Atos');
        $viewer->getId()->willReturn('theUserId');
        $viewer->isAdmin()->willReturn(true);
        $viewer->isSuperAdmin()->willReturn(false);

        $viewer->getPhone()->willReturn('+3311111111');
        $viewer->setPhoneConfirmed(false);

        $encodeId = GlobalId::toGlobalId('User', 'theUserId');
        $argumentsValues = ['userId' => $encodeId, 'username' => 'Portos'];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $formFactory->create(PersonalDataFormType::class, $viewer)->willReturn($form);

        $form->submit(['username' => 'Portos'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $this->__invoke($arguments, $viewer)->shouldBe(['user' => $viewer, 'errorCode' => null]);
    }

    public function it_update_myself_and_viewer_is_super_admin(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form
    ) {
        $arguments->offsetGet('stepId')->willReturn('stepId');

        $viewer->getUsername()->willReturn('Atos');
        $viewer->getId()->willReturn('theUserId');
        $viewer->isAdmin()->willReturn(true);
        $viewer->isSuperAdmin()->willReturn(true);
        $viewer->getPhone()->willReturn('+3311111111');
        $viewer->setPhoneConfirmed(false);

        $encodeId = GlobalId::toGlobalId('User', 'theUserId');
        $argumentsValues = ['userId' => $encodeId, 'username' => 'Portos'];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $formFactory->create(PersonalDataFormType::class, $viewer)->willReturn($form);

        $form->submit(['username' => 'Portos'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $this->__invoke($arguments, $viewer)->shouldBe(['user' => $viewer, 'errorCode' => null]);
    }

    public function it_update_an_other_user_and_viewer_is_super_admin(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        User $user,
        Form $form,
        UserRepository $userRepository
    ) {
        $arguments->offsetGet('stepId')->willReturn('stepId');

        $viewer->isAdmin()->willReturn(true);
        $viewer->isSuperAdmin()->willReturn(true);
        $viewer->getUsername()->willReturn('Atos');
        $viewer->getId()->willReturn('theUserId');

        $viewer->getPhone()->willReturn('+3311111111');
        $viewer->setPhoneConfirmed(false);

        $encodeId = GlobalId::toGlobalId('User', 'simpleUserId');
        $argumentsValues = ['userId' => $encodeId, 'username' => 'Portos'];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $userId = GlobalId::fromGlobalId($argumentsValues['userId'])['id'];

        $user->getUsername()->willReturn('simpleUser');
        $user->getId()->willReturn('simpleUserId');
        $userRepository
            ->find($userId)
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $formFactory->create(PersonalDataFormType::class, $user)->willReturn($form);

        $form->submit(['username' => 'Portos'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe(['user' => $user, 'errorCode' => null]);
    }

    public function it_update_an_other_user_and_viewer_is_admin(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $user,
        Form $form
    ) {
        $arguments->offsetGet('stepId')->willReturn('stepId');

        $user->isAdmin()->willReturn(true);
        $user->isSuperAdmin()->willReturn(false);
        $user->getUsername()->willReturn('Atos');
        $user->getId()->willReturn('theUserId');

        $user->getPhone()->willReturn('+3311111111');
        $user->setPhoneConfirmed(false);

        $encodeId = GlobalId::toGlobalId('User', 'badUserId');
        $argumentsValues = ['userId' => $encodeId, 'username' => 'Portos'];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $formFactory->create(PersonalDataFormType::class, $user)->willReturn($form);

        $form->submit(['username' => 'Portos'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(
            new UserError(
                'Only a SUPER_ADMIN can edit data from another user. Or the account owner'
            )
        )->during('__invoke', [$arguments, $user]);
    }

    public function it_update_a_user_and_viewer_is_user(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $user,
        Form $form
    ) {
        $arguments->offsetGet('stepId')->willReturn('stepId');

        $user->isAdmin()->willReturn(false);
        $user->isSuperAdmin()->willReturn(false);
        $user->getUsername()->willReturn('Atos');
        $user->getId()->willReturn('theUserId');

        $user->getPhone()->willReturn('+3311111111');
        $user->setPhoneConfirmed(false);

        $argumentsValues = ['username' => 'Portos', 'email' => 'portos@test.com'];
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $formFactory->create(PersonalDataFormType::class, $user)->willReturn($form);

        $form->submit($argumentsValues, false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $user)->shouldBe(['user' => $user, 'errorCode' => null]);
    }
}
