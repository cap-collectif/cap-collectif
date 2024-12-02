<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class AddUsersToGroupFromEmailMutation implements MutationInterface
{
    public function __construct(protected GroupRepository $groupRepository, protected LoggerInterface $logger, protected EntityManagerInterface $em, protected UserRepository $userRepository, protected UserGroupRepository $userGroupRepository, protected GlobalIdResolver $globalIdResolver)
    {
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

        $importedUsers = [];
        $notFoundEmails = [];
        $alreadyImportedUsers = [];

        try {
            foreach (array_unique($emails) as $email) {
                $user = $this->userRepository->findOneBy(['email' => $email]);
                if ($user instanceof User) {
                    $userGroup = $this->userGroupRepository->findOneBy([
                        'user' => $user,
                        'group' => $group,
                    ]);

                    if (!$userGroup) {
                        if (!$dryRun) {
                            $userGroup = new UserGroup();
                            $userGroup->setUser($user)->setGroup($group);

                            $this->em->persist($userGroup);
                        }
                        $importedUsers[] = $user;
                    } else {
                        $alreadyImportedUsers[] = $user;
                    }
                } else {
                    $notFoundEmails[] = $email;
                }
            }

            $this->em->flush();

            return [
                'importedUsers' => $importedUsers,
                'notFoundEmails' => $notFoundEmails,
                'alreadyImportedUsers' => $alreadyImportedUsers,
            ];
        } catch (\Exception) {
            $this->logger->error(
                static::class .
                    ' addUsersToGroupFromEmail: ' .
                    sprintf('Cannot add users in group with id "%g"', $groupId)
            );

            throw new UserError('Can\'t add users in group.');
        }
    }
}
