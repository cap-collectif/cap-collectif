<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\RecreatePasswordFormType;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ResetPasswordMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private UserPasswordEncoderInterface $userPasswordEncoder;
    private FormFactoryInterface $formFactory;
    private UserManager $userManager;
    private TranslatorInterface $translator;
    private SessionInterface $session;
    private LoginManagerInterface $loginManager;
    private string $firewallName;

    public function __construct(
        SessionInterface $session,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        UserManager $userManager,
        LoginManagerInterface $loginManager,
        UserPasswordEncoderInterface $userPasswordEncoder,
        TranslatorInterface $translator,
        $firewallName
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->translator = $translator;
        $this->userPasswordEncoder = $userPasswordEncoder;
        $this->userManager = $userManager;
        $this->session = $session;
        $this->loginManager = $loginManager;
        $this->firewallName = $firewallName;
    }

    public function __invoke(Argument $args): array
    {
        $token = $args->offsetGet('token');
        /** @var User $user */
        $user = $this->userManager->findUserByResetPasswordToken($token);
        if (null === $user) {
            return [
                'error' => sprintf(
                    'The user with "confirmation token" does not exist for value "%s"',
                    $token
                ),
            ];
        }
        $data = [];
        $data['plainPassword'] = [
            'first' => $args->offsetGet('password'),
            'second' => $args->offsetGet('password'),
        ];
        $form = $this->formFactory->create(RecreatePasswordFormType::class, $user, [
            'csrf_protection' => false,
        ]);
        $form->submit($data);
        if ($form->isSubmitted() && $form->isValid()) {
            $password = $this->userPasswordEncoder->encodePassword(
                $user,
                $user->getPlainPassword()
            );
            $user->setPassword($password);
            $this->em->flush();
            $flashBag = $this->session->getFlashBag();
            if ($flashBag) {
                $flashBag->add(
                    'fos_user_success',
                    $this->translator->trans('resetting.flash.success', [], 'CapcoAppBundle')
                );
            }
            $this->loginManager->logInUser($this->firewallName, $user, null);

            return [
                'user' => $user,
            ];
        }

        return [
            'error' => 'Form not valid.',
        ];
    }
}
