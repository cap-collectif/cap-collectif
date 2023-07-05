<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UpdateUserEmailErrorCode;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiProfileAccountFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;

class UpdateProfileAccountEmailMutation extends BaseUpdateProfile
{
    public const RATE_LIMITER_ACTION = 'UpdateProfileAccountEmail';

    private UserManager $userManager;
    private Publisher $publisher;
    private EncoderFactoryInterface $encoderFactory;
    private EmailDomainRepository $emailDomainRepository;
    private Manager $toggleManager;
    private TokenGeneratorInterface $tokenGenerator;
    private RateLimiter $rateLimiter;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        UserManager $userManager,
        Publisher $publisher,
        EncoderFactoryInterface $encoderFactory,
        EmailDomainRepository $emailDomainRepository,
        Manager $toggleManager,
        TokenGeneratorInterface $tokenGenerator,
        RateLimiter $rateLimiter
    ) {
        $this->userManager = $userManager;
        $this->publisher = $publisher;
        $this->encoderFactory = $encoderFactory;
        $this->emailDomainRepository = $emailDomainRepository;
        $this->toggleManager = $toggleManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->rateLimiter = $rateLimiter;
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getArrayCopy();

        $newEmailToConfirm = $arguments['email'];
        $password = $arguments['passwordConfirm'];
        $encoder = $this->encoderFactory->getEncoder($viewer);
        if (
            $viewer->hasPassword()
            && !$encoder->isPasswordValid($viewer->getPassword(), $password, $viewer->getSalt())
        ) {
            return ['error' => UpdateUserEmailErrorCode::SPECIFY_PASSWORD];
        }

        $this->rateLimiter->setLimit(3);

        if (
            false === $this->rateLimiter->canDoAction(self::RATE_LIMITER_ACTION, $viewer->getId())
        ) {
            return ['error' => RateLimiter::LIMIT_REACHED];
        }

        if ($this->userRepository->findOneByEmail($newEmailToConfirm)) {
            return ['error' => UpdateUserEmailErrorCode::ALREADY_USED_EMAIL];
        }

        if (
            $this->toggleManager->isActive('restrict_registration_via_email_domain')
            && !$this->emailDomainRepository->findOneBy([
                'value' => explode('@', $newEmailToConfirm)[1],
            ])
        ) {
            return ['error' => UpdateUserEmailErrorCode::UNAUTHORIZED_EMAIL_DOMAIN];
        }

        $form = $this->formFactory->create(ApiProfileAccountFormType::class, $viewer, [
            'csrf_protection' => false,
        ]);
        $form->submit(['newEmailToConfirm' => $newEmailToConfirm], false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        // We generate a confirmation token to validate the new email
        $token = $this->tokenGenerator->generateToken();

        $this->publisher->publish(
            'user.email',
            new Message(
                json_encode([
                    'userId' => $viewer->getId(),
                ])
            )
        );

        $viewer->setNewEmailConfirmationToken($token);
        $this->userManager->updateUser($viewer);

        return ['viewer' => $viewer];
    }
}
