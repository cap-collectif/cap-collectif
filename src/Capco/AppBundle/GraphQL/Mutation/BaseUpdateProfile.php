<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

abstract class BaseUpdateProfile implements MutationInterface
{
    public const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    public const USER_ID = 'userId';
    public const USER = 'user';
    protected $userRepository;
    protected $em;
    protected $formFactory;
    protected $logger;
    protected $user;
    protected $arguments;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
    }

    public function __invoke(Argument $input, User $user)
    {
        $this->arguments = $input->getRawArguments();

        if (!$user->hasRole(self::ROLE_SUPER_ADMIN) && !empty($this->arguments[self::USER_ID])) {
            throw new UserError(
                'Only a SUPER_ADMIN can edit data from another user. Or the account owner'
            );
        }
        $this->user = $user;

        if (
            $user->hasRole(self::ROLE_SUPER_ADMIN) &&
            !empty($this->arguments[self::USER_ID]) &&
            $user->getId() !== $this->arguments[self::USER_ID]
        ) {
            $user = $this->userRepository->find($this->arguments[self::USER_ID]);
            if ($user) {
                $this->user = $user;
            }
        }

        if (isset($this->arguments[self::USER_ID])) {
            unset($this->arguments[self::USER_ID]);
        }
    }
}
