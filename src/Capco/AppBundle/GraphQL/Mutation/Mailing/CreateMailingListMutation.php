<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\CreateMailingListErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\MailingListVoter;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateMailingListMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly UserRepository $userRepository, private readonly ProjectRepository $projectRepository, private readonly EntityManagerInterface $entityManager, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly SettableOwnerResolver $settableOwnerResolver)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $error = null;
        $mailingList = null;

        try {
            $mailingList = $this->createMailingList($input, $viewer);
            $this->entityManager->persist($mailingList);
            $this->entityManager->flush();
        } catch (UserError $userError) {
            $error = $userError->getMessage();
        } catch (\RuntimeException) {
            $error = 'internal server error';
        }

        return compact('mailingList', 'error');
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(MailingListVoter::CREATE, new MailingList());
    }

    private function createMailingList(Argument $input, User $viewer): MailingList
    {
        $users = $this->getUsers($input);
        $project = $this->getProject($input, $viewer);

        $mailingList = new MailingList();
        $mailingList->setName($input->offsetGet('name'));
        $mailingList->setUsers($users);
        $mailingList->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );
        $mailingList->setProject($project);
        $mailingList->setCreator($viewer);

        return $mailingList;
    }

    private function getUsers(Argument $input): array
    {
        $users = [];
        foreach ($input->offsetGet('userIds') as $globalId) {
            $userId = GlobalId::fromGlobalId($globalId)['id'];
            if (null === $userId) {
                throw new UserError(CreateMailingListErrorCode::ID_NOT_FOUND_USER);
            }

            $user = $this->userRepository->find($userId);
            if (null === $user) {
                throw new UserError(CreateMailingListErrorCode::ID_NOT_FOUND_USER);
            }

            $users[] = $user;
        }
        if (empty($users)) {
            throw new UserError(CreateMailingListErrorCode::EMPTY_USERS);
        }

        return $users;
    }

    private function getProject(Argument $input, User $viewer): ?Project
    {
        if (null === $input->offsetGet('project')) {
            return null;
        }

        $projectId = GlobalId::fromGlobalId($input->offsetGet('project'))['id'];
        if (null === $projectId) {
            throw new UserError(CreateMailingListErrorCode::ID_NOT_FOUND_PROJECT);
        }

        $project = $this->projectRepository->find($projectId);
        if (
            null === $project
            || !$this->authorizationChecker->isGranted(ProjectVoter::VIEW, $project)
        ) {
            throw new UserError(CreateMailingListErrorCode::ID_NOT_FOUND_PROJECT);
        }

        return $project;
    }
}
