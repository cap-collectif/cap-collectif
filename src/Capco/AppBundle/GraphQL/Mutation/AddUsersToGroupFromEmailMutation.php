<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Service\GroupService;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class AddUsersToGroupFromEmailMutation implements MutationInterface
{
    public function __construct(
        protected GroupRepository $groupRepository,
        protected LoggerInterface $logger,
        protected EntityManagerInterface $em,
        protected UserRepository $userRepository,
        protected UserGroupRepository $userGroupRepository,
        protected GlobalIdResolver $globalIdResolver,
        private readonly GroupService $groupService
    ) {
    }

    public function __invoke(array $emails, bool $dryRun, string $groupId, User $viewer): array
    {
        $group = $this->globalIdResolver->resolve($groupId, $viewer);
        if (!$group instanceof Group) {
            $error = sprintf(
                '%s addUsersToGroupFromEmail: Cannot find the group "%g"',
                static::class,
                $groupId
            );
            $this->logger->error($error);

            throw new UserError('Group not found');
        }

        [$importedUsers, $notFoundEmails, $alreadyImportedUsers] = $this->groupService->addUsersToGroupFromEmail($emails, $group, $dryRun);

        $this->em->flush();

        return ['importedUsers' => $importedUsers, 'notFoundEmails' => $notFoundEmails, 'alreadyImportedUsers' => $alreadyImportedUsers];
    }
}
