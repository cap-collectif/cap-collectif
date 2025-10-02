<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\GraphQL\GraphQLRequestedFields;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Repository\UserRepository;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class MailingListUsersConnection implements QueryInterface
{
    public function __construct(
        private readonly MailingListRepository $repository,
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository,
        private readonly GraphQLRequestedFields $graphQLRequestedFields,
    ) {
    }

    public function __invoke($mailingList, ResolveInfo $info, Argument $argument): Connection
    {
        $isOnlyFetchingTotalCount = $this->graphQLRequestedFields->isOnlyFetchingTotalCount($info);
        $mailingList = $this->getMailingListEntity($mailingList);
        $consentInternalCommunicationOnly = $argument->offsetGet('consentInternalCommunicationOnly') ?? true;
        $paginator = new Paginator(fetcher: function (int $offset, int $limit) use ($mailingList, $consentInternalCommunicationOnly, $isOnlyFetchingTotalCount) {
            if ($isOnlyFetchingTotalCount) {
                return [];
            }

            $users = $this->userRepository
                ->getUsersInMailingList(
                    mailingList: $mailingList,
                    validEmailOnly: true,
                    consentInternalOnly: $consentInternalCommunicationOnly,
                    offset: $offset,
                    limit: $limit
                )
            ;

            $participants = $this->participantRepository
                ->getParticipantsInMailingList(
                    mailingList: $mailingList,
                    validEmailOnly: true,
                    consentInternalOnly: $consentInternalCommunicationOnly,
                    offset: $offset,
                    limit: $limit
                )
            ;

            return array_merge($users, $participants);
        });

        $countUsersInMailingList = $this->userRepository->countUsersInMailingList(
            $mailingList,
            true,
            $consentInternalCommunicationOnly
        );

        $countParticipantsInMailingList = $this->participantRepository->countParticipantsInMailingList(
            $mailingList,
            true,
            $consentInternalCommunicationOnly
        );

        $totalCount = $countParticipantsInMailingList + $countUsersInMailingList;

        return $paginator->auto(
            $argument,
            $totalCount
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
