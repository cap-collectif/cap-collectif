<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\UserInviteRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class RelaunchUserInvitationsMutation implements MutationInterface
{
    use MutationTrait;
    private const BATCH_SIZE = 800;

    private UserInviteRepository $userInviteRepository;
    private EntityManagerInterface $entityManager;
    private TokenGeneratorInterface $tokenGenerator;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        UserInviteRepository $userInviteRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->entityManager = $entityManager;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $invitationEmails = $args->offsetGet('emails');
        $invitations = $this->userInviteRepository->getExpiredInvitationByEmails($invitationEmails);

        $insertions = 0;
        foreach ($invitations as $invitation) {
            $invitation
                ->setExpiresAt((new \DateTimeImmutable())->modify(UserInvite::EXPIRES_AT_PERIOD))
                ->setToken($this->tokenGenerator->generateToken())
                ->addEmailMessage(new UserInviteEmailMessage($invitation))
            ;

            ++$insertions;
            if (0 === $insertions % self::BATCH_SIZE) {
                $this->entityManager->flush();
                $this->entityManager->clear(UserInviteEmailMessage::class);
            }
        }

        $this->entityManager->flush();
        $this->entityManager->clear(UserInviteEmailMessage::class);

        $offset = 0;
        $relaunchedInvitations = array_map(static function (UserInvite $invite) use (&$offset) {
            return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
        }, $invitations);

        return ['relaunchedInvitations' => $relaunchedInvitations];
    }
}
