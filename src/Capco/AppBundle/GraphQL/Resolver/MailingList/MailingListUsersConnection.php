<?php

namespace Capco\AppBundle\GraphQL\Resolver\MailingList;

use Capco\AppBundle\Entity\MailingList;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListUsersConnection implements ResolverInterface
{
    public function __invoke(MailingList $mailingList, Argument $argument): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($mailingList) {
            return $mailingList->getUsersWithValidEmail()->toArray();
        });

        return $paginator->auto($argument, $mailingList->getUsersWithValidEmail()->count());
    }
}
