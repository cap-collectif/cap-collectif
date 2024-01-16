<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Form\Type\PasswordFormType;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ResetPasswordMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;
    private UserPasswordEncoderInterface $userPasswordEncoder;
    private FormFactoryInterface $formFactory;
    private UserManager $userManager;
    private TranslatorInterface $translator;
    private SessionInterface $session;
    private LoginManagerInterface $loginManager;
    private string $firewallName;
    private LoggerInterface $logger;

    public function __construct(
        SessionInterface $session,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        UserManager $userManager,
        LoginManagerInterface $loginManager,
        UserPasswordEncoderInterface $userPasswordEncoder,
        TranslatorInterface $translator,
        LoggerInterface $logger,
        string $firewallName
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->translator = $translator;
        $this->userPasswordEncoder = $userPasswordEncoder;
        $this->userManager = $userManager;
        $this->session = $session;
        $this->loginManager = $loginManager;
        $this->firewallName = $firewallName;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $token = $args->offsetGet('token');
        $user = $this->userManager->findUserByResetPasswordToken($token);
        if (null === $user) {
            return [
                'error' => sprintf(
                    'The user with "confirmation token" does not exist for value "%s"',
                    $token
                ),
            ];
        }
        $data = ['plainPassword' => $args->offsetGet('password')];
        $form = $this->formFactory->create(PasswordFormType::class, $user, [
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
        foreach ($form->getErrors(true) as $error) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));
        }

        return [
            'error' => 'Form not valid.',
        ];
    }
}
