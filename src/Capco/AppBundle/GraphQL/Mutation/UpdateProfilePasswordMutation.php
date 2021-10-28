<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ChangePasswordFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProfilePasswordMutation extends BaseUpdateProfile
{
    private UserManager $userManager;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        UserManager $userManager,
        Publisher $publisher
    ) {
        $this->userManager = $userManager;
        $this->publisher = $publisher;
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getArrayCopy();
        $form = $this->formFactory->create(ChangePasswordFormType::class, null, [
            'csrf_protection' => false,
        ]);
        $form->submit(
            [
                'current_password' => $arguments['current_password'],
                'new_password' => $arguments['new_password'],
            ],
            false
        );
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            return [self::USER => $viewer, 'error' => 'fos_user.password.not_current'];
        }
        $this->logger->debug(__METHOD__ . ' : ' . (string) $form->isValid());
        $viewer->setPlainPassword($arguments['new_password']);
        $this->userManager->updateUser($viewer);
        $this->publisher->publish(
            'user.password',
            new Message(
                json_encode([
                    'userId' => $viewer->getId(),
                ])
            )
        );

        return [self::USER => $viewer];
    }
}
