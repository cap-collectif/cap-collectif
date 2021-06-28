<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Mailer\SenderEmailDomains\SenderEmailDomainsManager;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateSenderEmailDomainMutation implements MutationInterface
{
    public const ALREADY_EXIST = 'ALREADY_EXIST';

    private EntityManagerInterface $em;
    private SenderEmailDomainsManager $manager;

    public function __construct(EntityManagerInterface $em, SenderEmailDomainsManager $manager)
    {
        $this->em = $em;
        $this->manager = $manager;
    }

    public function __invoke(Argument $input): array
    {
        try {
            $domain = $this->manager->createSenderEmailDomain(
                $input->offsetGet('value'),
                $input->offsetGet('service')
            );

            $this->em->persist($domain);
            $this->em->flush();
        } catch (UniqueConstraintViolationException $exception) {
            return ['errorCode' => self::ALREADY_EXIST];
        }

        return ['senderEmailDomain' => $domain];
    }
}
