<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
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
    protected $groupRepository;
    protected $logger;
    protected $em;
    protected $userRepository;
    protected $userGroupRepository;

    public function __construct(
        GroupRepository $groupRepository,
        LoggerInterface $logger,
        EntityManagerInterface $em,
        UserRepository $userRepository,
        UserGroupRepository $userGroupRepository
    ) {
        $this->groupRepository = $groupRepository;
        $this->logger = $logger;
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->userGroupRepository = $userGroupRepository;
    }

    public function __invoke(array $emails, bool $dryRun, string $groupId): array
    {
        /** @var Group $group */
        $group = $this->groupRepository->find($groupId);

        if (!$group) {
            $error = sprintf(
                '%s addUsersToGroupFromEmail: Cannot find the group "%g"',
                \get_class($this),
                $groupId
            );
            $this->logger->error($error);
            throw new UserError('Can\'t add users in group.');
        }

        $importedUsers = [];
        $notFoundEmails = [];
        $alreadyImportedUsers = [];

        try {
            foreach (array_unique($emails) as $email) {
                /** @var User $user */
                $user = $this->userRepository->findOneBy(['email' => $email]);

                if ($user) {
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
        } catch (\Exception $e) {
            $this->logger->error(
                \get_class($this) .
                    ' addUsersToGroupFromEmail: ' .
                    sprintf('Cannot add users in group with id "%g"', $groupId)
            );
            throw new UserError('Can\'t add users in group.');
        }
    }
}
