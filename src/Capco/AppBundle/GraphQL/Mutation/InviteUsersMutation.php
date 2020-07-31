<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class InviteUsersMutation implements MutationInterface
{
    private const EXPIRES_AT_PERIOD = '+ 7 days';
    private const BATCH_SIZE = 800;

    private TokenGeneratorInterface $tokenGenerator;
    private EntityManagerInterface $em;
    private UserInviteRepository $userInviteRepository;
    private UserRepository $userRepository;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        EntityManagerInterface $em,
        UserInviteRepository $userInviteRepository,
        UserRepository $userRepository
    ) {
        $this->tokenGenerator = $tokenGenerator;
        $this->em = $em;
        $this->userInviteRepository = $userInviteRepository;
        $this->userRepository = $userRepository;
    }

    public function __invoke(Argument $args): array
    {
        list($emails, $isAdmin, $maxResults) = [
            array_filter($args->offsetGet('emails')),
            $args->offsetGet('isAdmin'),
            $args->offsetGet('maxResults'),
        ];

        $existingInviteEmails = $this->userInviteRepository->findAllEmails();
        $existingUserEmails = $this->userRepository->findByEmails($emails);
        $toUpdateEmails = [];
        $newInvitations = [];

        $insertions = 0;
        foreach ($emails as $email) {
            if (\in_array($email, $existingInviteEmails, true)) {
                $toUpdateEmails[] = $email;

                continue;
            }
            if (\in_array($email, $existingUserEmails, true)) {
                continue;
            }
            $invitation = (new UserInvite())
                ->setEmail($email)
                ->setIsAdmin($isAdmin)
                ->setToken($this->tokenGenerator->generateToken())
                ->setExpiresAt((new \DateTimeImmutable())->modify(self::EXPIRES_AT_PERIOD));
            $newInvitations[] = $invitation;
            $this->em->persist($invitation);
            ++$insertions;
            if (0 === $insertions % self::BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear();
            }
        }

        $this->em->flush();
        $this->em->clear();

        if (\count($toUpdateEmails) > 0) {
            $entity = UserInvite::class;
            $this->em
                ->createQuery(
                    <<<DQL
UPDATE ${entity} ui SET ui.expiresAt = :expiration, ui.isAdmin = :isAdmin WHERE ui.email IN (:emails)
DQL
                )
                ->execute([
                    'expiration' => new \DateTimeImmutable(self::EXPIRES_AT_PERIOD),
                    'emails' => $toUpdateEmails,
                    'isAdmin' => $isAdmin,
                ]);
        }

        $offset = 0;
        $newInvitations = array_map(function (UserInvite $invite) use (&$offset) {
            return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
        }, $newInvitations);
        $newInvitations = \array_slice($newInvitations, 0, $maxResults);

        $offset = 0;
        $updatedInvitations =
            0 === \count($toUpdateEmails)
                ? []
                : array_map(function (UserInvite $invite) use (&$offset) {
                    return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
                }, $this->userInviteRepository->findByEmails($toUpdateEmails));
        $updatedInvitations = \array_slice($updatedInvitations, 0, $maxResults);

        return compact('newInvitations', 'updatedInvitations');
    }
}
