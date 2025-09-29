<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\SenderEmail;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SenderEmailDomainRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CreateSenderEmailMutation implements MutationInterface
{
    use MutationTrait;

    final public const ALREADY_EXIST = 'ALREADY_EXIST';
    final public const INVALID_DOMAIN = 'INVALID_DOMAIN';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SenderEmailDomainRepository $domainRepository
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            $this->checkDomainExists($input->offsetGet('domain'));
            $senderEmail = $this->createSenderEmail($input);

            $this->em->persist($senderEmail);
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            return ['errorCode' => self::ALREADY_EXIST];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return ['senderEmail' => $senderEmail];
    }

    private function createSenderEmail(Argument $input): SenderEmail
    {
        return (new SenderEmail())
            ->setLocale($input->offsetGet('locale'))
            ->setDomain($input->offsetGet('domain'))
        ;
    }

    private function checkDomainExists(string $domain): void
    {
        if (0 === $this->domainRepository->count(['value' => $domain])) {
            throw new UserError(self::INVALID_DOMAIN);
        }
    }
}
