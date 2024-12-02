<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListUsersConnection implements QueryInterface
{
    public function __construct(private readonly MailingListRepository $repository, private readonly UserRepository $userRepository)
    {
    }

    public function __invoke($mailingList, Argument $argument): Connection
    {
        $mailingList = $this->getMailingListEntity($mailingList);
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $mailingList,
            $argument
        ) {
            return $this->userRepository
                ->getUsersInMailingList(
                    $mailingList,
                    true,
                    $argument->offsetGet('consentInternalCommunicationOnly'),
                    $offset,
                    $limit
                )
                ->getIterator()
                ->getArrayCopy()
            ;
        });

        return $paginator->auto(
            $argument,
            $this->userRepository->countUsersInMailingList(
                $mailingList,
                true,
                $argument->offsetGet('consentInternalCommunicationOnly')
            )
        );
    }

    private function getMailingListEntity($mailingList): MailingList
    {
        if ($mailingList instanceof MailingList) {
            return $mailingList;
        }

        return $this->repository->find($mailingList['id']);
    }
}
