<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Form\GroupCreateType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Service\GroupService;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class GroupMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly EntityManagerInterface $entityManager,
        private readonly FormFactoryInterface $formFactory,
        private readonly GroupRepository $groupRepository,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EmailingCampaignRepository $emailingCampaignRepository,
        private readonly GroupService $groupService
    ) {
    }

    /**
     * @param string[] $emails
     *
     * @return array{group: Group, importedUsers: User[], notFoundEmails: string[], alreadyImportedUsers: User[]}
     */
    public function create(array $emails, bool $dryRun, string $title, ?string $description): array
    {
        $group = new Group();

        $form = $this->formFactory->create(GroupCreateType::class, $group);

        $form->submit(['title' => $title, 'description' => $description], false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' create: ' . (string) $form->getErrors(true, false));

            throw new UserError('Can\'t create this group.');
        }

        if (!$dryRun) {
            $this->entityManager->persist($group);
        }

        [$importedUsers, $notFoundEmails, $alreadyImportedUsers] = $this->groupService->addUsersToGroupFromEmail($emails, $group, $dryRun, true);

        if (!$dryRun) {
            $this->entityManager->flush();
        }

        return [
            'group' => $group,
            'importedUsers' => $importedUsers,
            'notFoundEmails' => $notFoundEmails,
            'alreadyImportedUsers' => $alreadyImportedUsers,
        ];
    }

    /**
     * @param string[] $emails
     * @param string[] $toAddUserIds
     * @param string[] $toRemoveUserIds
     *
     * @return array{group: Group, importedUsers: User[], notFoundEmails: string[], alreadyImportedUsers: User[]}
     */
    public function update(
        string $groupId,
        array $emails,
        array $toAddUserIds,
        string $title,
        ?string $description,
        array $toRemoveUserIds,
        User $user
    ): array {
        $group = $this->globalIdResolver->resolve($groupId, $user);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%d"', $groupId));
        }

        $form = $this->formFactory->create(GroupCreateType::class, $group);
        $form->submit(['title' => $title, 'description' => $description], false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' update: ' . (string) $form->getErrors(true, false));

            throw new UserError('Can\'t update this group.');
        }

        [$importedUsers, $notFoundEmails, $alreadyImportedUsers] = $this->groupService->addUsersToGroupFromEmail($emails, $group);

        if ([] !== $toAddUserIds) {
            $this->groupService->addUsersInGroupFromIds($toAddUserIds, $group);
        }

        $this->groupService->deleteUsersInGroup($toRemoveUserIds, $group);

        $this->entityManager->flush();

        return [
            'group' => $group,
            'importedUsers' => $importedUsers,
            'notFoundEmails' => $notFoundEmails,
            'alreadyImportedUsers' => $alreadyImportedUsers,
        ];
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

        $groupId = $group->getId();

        try {
            $this->entityManager->remove($group);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            $this->logger->error(__METHOD__ . ' delete: ' . $group->getId());
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());

            throw new UserError('Can\'t delete this group.');
        }

        return ['deletedGroupId' => $groupId];
    }

    /**
     * @return array{group: Group}
     */
    public function deleteUserInGroup(string $userId, string $groupId, mixed $viewer): array
    {
        $group = $this->globalIdResolver->resolve($groupId, $viewer);

        $this->groupService->deleteUsersInGroup([$userId], $group);

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
        }

        $groupId = GlobalId::toGlobalId('Group', $group->getId());

        /** @var Group $group */
        $group = $this->globalIdResolver->resolve($groupId, $user);

        if (!$group) {
            $error = sprintf('Cannot find the group "%g"', $groupId);
            $this->logger->error(__METHOD__ . ' addUsersInGroup: ' . $error);

            throw new UserError($error);
        }

        $this->groupService->addUsersInGroupFromIds(
            [GlobalId::toGlobalId('User', $user->getId())],
            $group
        );

        $this->entityManager->flush();
    }
}
