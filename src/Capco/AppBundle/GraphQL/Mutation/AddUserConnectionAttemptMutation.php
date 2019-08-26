<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserConnection;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddUserConnectionAttemptMutation implements MutationInterface
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function __invoke(Arg $input, User $user = null): array
    {
        $email = $input->offsetGet('email');
        $ipAddress = $input->offsetGet('ipAddress');
        $isSuccess = $input->offsetGet('success');

        $userConnection = new UserConnection();
        $userConnection
            ->setDatetime(new \DateTime())
            ->setEmail($email)
            ->setSuccess($isSuccess)
            ->setIpAddress($ipAddress);
        $this->em->persist($userConnection);
        $this->em->flush();

        return ['userConnectionAttempt' => $userConnection];
    }
}
