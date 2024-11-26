<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\SenderEmailDomain;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SenderEmailDomainRepository;
use Capco\AppBundle\Repository\SenderEmailRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DeleteSenderEmailDomainMutation implements MutationInterface
{
    use MutationTrait;

    final public const NOT_FOUND = 'NOT_FOUND';
    final public const DOMAIN_USED = 'DOMAIN_USED';

    private readonly EntityManagerInterface $entityManager;
    private readonly SenderEmailDomainRepository $senderEmailDomainRepository;
    private readonly SenderEmailRepository $senderEmailRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SenderEmailDomainRepository $senderEmailDomainRepository,
        SenderEmailRepository $senderEmailRepository
    ) {
        $this->entityManager = $entityManager;
        $this->senderEmailDomainRepository = $senderEmailDomainRepository;
        $this->senderEmailRepository = $senderEmailRepository;
    }

    public function __invoke(Argument $input)
    {
        $this->formatInput($input);

        try {
            $domain = $this->getSenderEmailDomain($input->offsetGet('id'));
            $this->checkIsNotUsed($domain);
            $this->entityManager->remove($domain);
            $this->entityManager->flush();

            return ['deletedId' => $input->offsetGet('id')];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getSenderEmailDomain(string $id): SenderEmailDomain
    {
        $domain = $this->senderEmailDomainRepository->find($id);
        if (!$domain) {
            throw new UserError(self::NOT_FOUND);
        }

        return $domain;
    }

    private function checkIsNotUsed(SenderEmailDomain $domain): void
    {
        if (0 < $this->senderEmailRepository->count(['domain' => $domain->getValue()])) {
            throw new UserError(self::DOMAIN_USED);
        }
    }
}
