<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

abstract class BaseUpdateProfile implements MutationInterface
{
    final public const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    final public const USER_ID = 'userId';
    final public const USER = 'user';
    protected ?User $user = null;
    protected array $arguments = [];

    public function __construct(
        protected EntityManagerInterface $em,
        protected FormFactoryInterface $formFactory,
        protected LoggerInterface $logger,
        protected UserRepository $userRepository
    ) {
    }

    public function __invoke(Argument $input, User $viewer)
    {
        $this->arguments = $input->getArrayCopy();
        $this->user = $viewer;
        $userId = GlobalId::fromGlobalId($this->arguments[self::USER_ID])['id'];
        if (!empty($this->arguments[self::USER_ID])) {
            if ($viewer->isAdmin() && !$viewer->isSuperAdmin() && $viewer->getId() !== $userId) {
                throw new UserError('Only a SUPER_ADMIN can edit data from another user. Or the account owner');
            }
            if (!$viewer->isAdmin() && !$viewer->isSuperAdmin() && $viewer->getId() !== $userId) {
                throw new UserError('Only a SUPER_ADMIN can edit data from another user. Or the account owner');
            }
        }

        if ($viewer->isSuperAdmin() && !empty($this->arguments[self::USER_ID])) {
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
