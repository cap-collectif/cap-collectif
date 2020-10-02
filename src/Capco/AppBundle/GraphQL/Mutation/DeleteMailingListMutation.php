<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\DeleteMailingListErrorCode;
use Capco\AppBundle\Repository\MailingListRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteMailingListMutation implements MutationInterface
{
    private MailingListRepository $repository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        MailingListRepository $mailingListRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->repository = $mailingListRepository;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Argument $input): array
    {
        $error = null;
        $deletedIds = [];

        $mailingLists = $this->getMailingLists($input, $error);

        if (null === $error) {
            try {
                foreach ($mailingLists as $globalId => $mailingList) {
                    $this->entityManager->remove($mailingList);
                    $deletedIds[] = $globalId;
                }
                $this->entityManager->flush();
            } catch (\Exception $exception) {
                $error = 'internal server error';
            }
        }

        return compact('error', 'deletedIds');
    }

    private function getMailingLists(Argument $input, ?string &$error): array
    {
        $mailingLists = [];
        foreach ($input->offsetGet('ids') as $globalId) {
            $id = GlobalId::fromGlobalId($globalId)['id'];
            if (null === $id) {
                $error = DeleteMailingListErrorCode::ID_NOT_FOUND;

                return [];
            }

            $mailingList = $this->repository->find($id);
            if (null === $mailingList) {
                $error = DeleteMailingListErrorCode::ID_NOT_FOUND;

                return [];
            }

            if (!$mailingList->isDeletable()) {
                $error = DeleteMailingListErrorCode::NOT_DELETABLE;

                return [];
            }

            $mailingLists[$globalId] = $mailingList;
        }

        if (empty($mailingLists)) {
            $error = DeleteMailingListErrorCode::EMPTY_MAILING_LISTS;
        }

        return $mailingLists;
    }
}
