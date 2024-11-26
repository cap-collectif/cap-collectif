<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\DeleteMailingListErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Security\MailingListVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteMailingListMutation implements MutationInterface
{
    use MutationTrait;
    private readonly MailingListRepository $repository;
    private readonly EntityManagerInterface $entityManager;
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly LoggerInterface $logger;

    public function __construct(
        MailingListRepository $mailingListRepository,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        LoggerInterface $logger
    ) {
        $this->repository = $mailingListRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $error = null;
        $deletedIds = [];

        try {
            $mailingLists = $this->getMailingLists($input, $viewer);
            foreach ($mailingLists as $globalId => $mailingList) {
                $this->entityManager->remove($mailingList);
                $deletedIds[] = $globalId;
            }
            $this->entityManager->flush();
        } catch (UserError $userError) {
            $error = $userError->getMessage();
        } catch (\Exception $exception) {
            $this->logger->error($exception->getMessage());
            $error = 'internal server error';
        }

        return compact('error', 'deletedIds');
    }

    private function getMailingLists(Argument $input, User $viewer): array
    {
        $mailingLists = [];
        foreach ($input->offsetGet('ids') as $globalId) {
            $id = GlobalId::fromGlobalId($globalId)['id'];
            if (null === $id) {
                throw new UserError(DeleteMailingListErrorCode::ID_NOT_FOUND);
            }

            $mailingLists[$globalId] = $this->getMailingListFromId($id, $viewer);
        }

        if (empty($mailingLists)) {
            throw new UserError(DeleteMailingListErrorCode::EMPTY_MAILING_LISTS);
        }

        return $mailingLists;
    }

    private function getMailingListFromId(string $id, User $viewer): MailingList
    {
        $mailingList = $this->repository->find($id);
        if (
            null === $mailingList
            || !$this->authorizationChecker->isGranted(MailingListVoter::VIEW, $mailingList)
        ) {
            throw new UserError(DeleteMailingListErrorCode::ID_NOT_FOUND);
        }

        if (!$this->authorizationChecker->isGranted(MailingListVoter::DELETE, $mailingList)) {
            throw new UserError(DeleteMailingListErrorCode::NOT_DELETABLE);
        }

        return $mailingList;
    }
}
