<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\CreateMailingListErrorCode;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class CreateMailingListMutation implements MutationInterface
{
    private UserRepository $userRepository;
    private ProjectRepository $projectRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        UserRepository $userRepository,
        ProjectRepository $projectRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->userRepository = $userRepository;
        $this->projectRepository = $projectRepository;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;
        $mailingList = $this->createMailingList($input, $viewer, $error);

        if ($mailingList) {
            try {
                $this->entityManager->persist($mailingList);
                $this->entityManager->flush();
            } catch (\Exception $exception) {
                $error = 'internal server error';
            }
        }

        return compact('mailingList', 'error');
    }

    private function createMailingList(Argument $input, User $viewer, ?string &$error): ?MailingList
    {
        $users = $this->getUsers($input, $error);
        if ($error) {
            return null;
        }

        $project = $this->getProject($input, $error);
        if ($error) {
            return null;
        }

        $mailingList = new MailingList();
        $mailingList->setName($input->offsetGet('name'));
        $mailingList->setUsers($users);
        $mailingList->setProject($project);
        $mailingList->setOwner($viewer);

        return $mailingList;
    }

    private function getUsers(Argument $input, ?string &$error): array
    {
        $users = [];
        foreach ($input->offsetGet('userIds') as $globalId) {
            $userId = GlobalId::fromGlobalId($globalId)['id'];
            if (null === $userId) {
                $error = CreateMailingListErrorCode::ID_NOT_FOUND_USER;

                return [];
            }

            $user = $this->userRepository->find($userId);
            if (null === $user) {
                $error = CreateMailingListErrorCode::ID_NOT_FOUND_USER;

                return [];
            }

            $users[] = $user;
        }
        if (empty($users)) {
            $error = CreateMailingListErrorCode::EMPTY_USERS;
        }

        return $users;
    }

    private function getProject(Argument $input, ?string &$error): ?Project
    {
        if (!$input->offsetExists('project')) {
            return null;
        }

        $projectId = GlobalId::fromGlobalId($input->offsetGet('project'))['id'];
        if (null === $projectId) {
            $error = CreateMailingListErrorCode::ID_NOT_FOUND_PROJECT;

            return null;
        }

        $project = $this->projectRepository->find($projectId);
        if (null === $project) {
            $error = CreateMailingListErrorCode::ID_NOT_FOUND_PROJECT;

            return null;
        }

        return $project;
    }
}
