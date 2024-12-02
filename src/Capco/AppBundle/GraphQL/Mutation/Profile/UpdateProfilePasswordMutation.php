<?php

namespace Capco\AppBundle\GraphQL\Mutation\Profile;

use Capco\AppBundle\GraphQL\Mutation\BaseUpdateProfile;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
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
    use MutationTrait;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        private readonly UserManager $userManager,
        private readonly Publisher $publisher
    ) {
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
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
        $this->logger->debug(__METHOD__ . ' : ' . $viewer->getId());
        $viewer->setPlainPassword($arguments['new_password']);
        $viewer->setUpdatedAt(new \DateTime());
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
