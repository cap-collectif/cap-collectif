<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Form\GroupCreateType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class GroupMutation implements MutationInterface
{
    use MutationTrait;
    private LoggerInterface $logger;
    private UserRepository $userRepository;
    private GroupRepository $groupRepository;
    private FormFactoryInterface $formFactory;
    private EntityManagerInterface $entityManager;
    private UserGroupRepository $userGroupRepository;
    private GlobalIdResolver $globalIdResolver;
    private EmailingCampaignRepository $emailingCampaignRepository;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        UserRepository $userRepository,
        UserGroupRepository $userGroupRepository,
        GroupRepository $groupRepository,
        GlobalIdResolver $globalIdResolver,
        EmailingCampaignRepository $emailingCampaignRepository
    ) {
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->groupRepository = $groupRepository;
        $this->userGroupRepository = $userGroupRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->emailingCampaignRepository = $emailingCampaignRepository;
    }

    public function create(Argument $input): array
    {
        $this->formatInput($input);
        $group = new Group();

        $form = $this->formFactory->create(GroupCreateType::class, $group);

        $form->submit($input->getArrayCopy(), false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' create: ' . (string) $form->getErrors(true, false));

            throw new UserError('Can\'t create this group.');
        }

        $this->entityManager->persist($group);
        $this->entityManager->flush();

        return ['group' => $group];
    }

    public function update(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
        $group = $this->globalIdResolver->resolve($arguments['groupId'], $user);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%d"', $arguments['groupId']));
        }

        unset($arguments['groupId']);

        $form = $this->formFactory->create(GroupCreateType::class, $group);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' update: ' . (string) $form->getErrors(true, false));

            throw new UserError('Can\'t update this group.');
        }

        $this->entityManager->flush();

        return ['group' => $group];
    }

    public function delete(string $groupId, User $user): array
    {
        /** @var ?Group $group */
        $group = $this->globalIdResolver->resolve($groupId, $user);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%s"', $groupId));
        }
        $isGroupUsedInCampaign = $this->emailingCampaignRepository->countEmailingCampaignUsingGroup(
            $group
        );
        if (!$group->isDeletable() && !$isGroupUsedInCampaign) {
            throw new UserError(sprintf('This group can\'t be deleted because it\'s protected "%s"', $groupId));
        }

        try {
            $this->entityManager->remove($group);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            $this->logger->error(__METHOD__ . ' delete: ' . $group->getId());
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());

            throw new UserError('Can\'t delete this group.');
        }

        return ['deletedGroupTitle' => $group->getTitle()];
    }

    public function deleteUserInGroup(string $userId, string $groupId, $viewer): array
    {
        $userId = GlobalId::fromGlobalId($userId)['id'];
        $group = $this->globalIdResolver->resolve($groupId, $viewer);
        $userGroup = $this->userGroupRepository->findOneBy([
            'user' => $userId,
            'group' => $group->getId(),
        ]);

        if (!$userGroup) {
            $error = sprintf('Cannot find the user "%u" in group "%g"', $userId, $groupId);

            $this->logger->error(__METHOD__ . ' deleteUserInGroup: ' . $error);

            throw new UserError('Can\'t delete this user in group.');
        }

        $group = $userGroup->getGroup();

        $this->entityManager->remove($userGroup);
        $this->entityManager->flush();

        return ['group' => $group];
    }

    public function createAndAddUserInGroup(User $user, string $groupName): void
    {
        /** @var Group $group */
        $group = $this->groupRepository->getOneByTitle($groupName);

        if (!$group) {
            $group = new Group();
            $group
                ->setTitle($groupName)
                ->setIsDeletable(false)
                ->setDescription('Group for ' . $groupName . ' Users')
                ->setSlug('group-' . $groupName)
            ;

            $this->entityManager->persist($group);
            $this->entityManager->flush();
        }

        $this->addUsersInGroup(
            [GlobalId::toGlobalId('User', $user->getId())],
            GlobalId::toGlobalId('Group', $group->getId()),
            '.anon'
        );
    }

    public function addUsersInGroup(array $users, string $groupId, $viewer): array
    {
        /** @var Group $group */
        $group = $this->globalIdResolver->resolve($groupId, $viewer);

        if (!$group) {
            $error = sprintf('Cannot find the group "%g"', $groupId);
            $this->logger->error(__METHOD__ . ' addUsersInGroup: ' . $error);

            throw new UserError($error);
        }

        try {
            foreach ($users as $userId) {
                $userId = GlobalId::fromGlobalId($userId)['id'];
                /** @var User $user */
                $user = $this->userRepository->find($userId);

                if ($user) {
                    $userGroup = $this->userGroupRepository->findOneBy([
                        'user' => $user,
                        'group' => $group,
                    ]);

                    if (!$userGroup) {
                        $userGroup = new UserGroup();
                        $userGroup->setUser($user)->setGroup($group);

                        $this->entityManager->persist($userGroup);
                    }
                }
            }

            $this->entityManager->flush();

            return ['group' => $group];
        } catch (\Exception $e) {
            $this->logger->error(
                __METHOD__ .
                    ' addUsersInGroup: ' .
                    sprintf(
                        'Cannot add users in group with id "%g. Cause : %s"',
                        $groupId,
                        $e->getMessage()
                    )
            );

            throw new UserError('Can\'t add users in group.');
        }
    }
}
