<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use GraphQL\Error\UserError;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

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

    public function __invoke(Argument $input, User $viewer)
    {
        $this->arguments = $input->getRawArguments();

        if (!$viewer->hasRole(self::ROLE_SUPER_ADMIN) && !empty($this->arguments[self::USER_ID])) {
            throw new UserError(
                'Only a SUPER_ADMIN can edit data from another user. Or the account owner'
            );
        }
        $this->user = $viewer;

        if ($viewer->hasRole(self::ROLE_SUPER_ADMIN) && !empty($this->arguments[self::USER_ID])) {
            $userId = GlobalId::fromGlobalId($this->arguments[self::USER_ID])['id'];
            $user = $this->userRepository->find($userId);
            if ($user && $user->getId() !== $viewer->getId()) {
                $this->user = $user;
            }
        }

        if (isset($this->arguments[self::USER_ID])) {
            unset($this->arguments[self::USER_ID]);
        }
    }
}
