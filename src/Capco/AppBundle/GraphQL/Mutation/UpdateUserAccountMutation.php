<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserAccountFormType;
use Capco\UserBundle\Form\Type\UserFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Monolog\Logger;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactory;

class UpdateUserAccountMutation
{
    private $em;
    private $formFactory;
    private $userRepository;
    private $logger;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, UserRepository $userRepository, Logger $logger)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        /** @var User $user */
        $user = $this->userRepository->find($arguments['userId']);

        if(!$user) {
            throw new UserError('Invalid user.');
        }

        unset($arguments['userId']);

        $form = $this->formFactory->create(UserAccountFormType::class, $user, ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw new UserError('Invalid data.');
        }

        $this->em->flush();

        return ['user' => $user];
    }
}
