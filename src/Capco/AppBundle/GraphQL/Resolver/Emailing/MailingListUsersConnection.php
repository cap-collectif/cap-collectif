<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Repository\MailingListRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListUsersConnection implements ResolverInterface
{
    private MailingListRepository $repository;

    public function __construct(MailingListRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke($mailingList, Argument $argument): Connection
    {
        $mailingList = $this->getMailingListEntity($mailingList);
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $mailingList,
            $argument
        ) {
            return $mailingList
                ->getUsersWithValidEmail($argument->offsetGet('consentInternalCommunicationOnly'))
                ->toArray();
        });

        return $paginator->auto(
            $argument,
            $mailingList
                ->getUsersWithValidEmail($argument->offsetGet('consentInternalCommunicationOnly'))
                ->count()
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
