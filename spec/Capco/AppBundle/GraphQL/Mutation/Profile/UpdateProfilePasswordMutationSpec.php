<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Profile;

use Capco\AppBundle\GraphQL\Mutation\Profile\UpdateProfilePasswordMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ChangePasswordFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class UpdateProfilePasswordMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        UserManager $userManager,
        Publisher $publisher
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $logger,
            $userRepository,
            $userManager,
            $publisher
        );
    }

    public function it_is_initialiable()
    {
        $this->shouldHaveType(UpdateProfilePasswordMutation::class);
    }

    public function it_should_fail_on_invalid_form(
        Argument $input,
        User $viewer,
        FormFactory $formFactory,
        FormInterface $form,
        LoggerInterface $logger
    ) {
        $data = [
            'current_password' => 'currentPassword',
            'new_password' => 'newPassword',
        ];
        $input
            ->getArrayCopy()
            ->shouldBeCalled()
            ->willReturn($data);

        $formFactory
            ->create(ChangePasswordFormType::class, null, ['csrf_protection' => false])
            ->shouldBeCalled()
            ->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(false);
        $form
            ->getErrors(true, false)
            ->shouldBeCalled()
            ->willReturn('shameOnYou');

        $logger
            ->error(
                'Capco\AppBundle\GraphQL\Mutation\Profile\UpdateProfilePasswordMutation::__invoke : shameOnYou'
            )
            ->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['user']->shouldBe($viewer);
        $payload['error']->shouldBe('fos_user.password.not_current');
    }

    public function it_should_succeed_on_valid_form(
        Argument $input,
        User $viewer,
        FormFactory $formFactory,
        FormInterface $form,
        LoggerInterface $logger,
        UserManager $userManager,
        Publisher $publisher
    ) {
        $newPassword = 'newPassword';
        $data = [
            'current_password' => 'currentPassword',
            'new_password' => $newPassword,
        ];
        $input
            ->getArrayCopy()
            ->shouldBeCalled()
            ->willReturn($data);

        $viewerId = 'viewerId';
        $viewer
            ->getId()
            ->shouldBeCalled()
            ->willReturn($viewerId);
        $viewer->setPlainPassword($newPassword)->shouldBeCalled();
        $viewer->setUpdatedAt(\Prophecy\Argument::type('\DateTime'))->shouldBeCalled();

        $formFactory
            ->create(ChangePasswordFormType::class, null, ['csrf_protection' => false])
            ->shouldBeCalled()
            ->willReturn($form);
        $form->submit($data, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true);

        $logger
            ->debug(
                'Capco\AppBundle\GraphQL\Mutation\Profile\UpdateProfilePasswordMutation::__invoke : ' .
                    $viewerId
            )
            ->shouldBeCalled();
        $userManager->updateUser($viewer)->shouldBeCalled();
        $publisher->publish(
            'user.password',
            new Message(
                json_encode([
                    'userId' => $viewerId,
                ])
            )
        );

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['user']->shouldBe($viewer);
    }
}
