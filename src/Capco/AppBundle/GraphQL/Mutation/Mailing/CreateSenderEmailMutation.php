<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\SenderEmail;
use Capco\AppBundle\Repository\SenderEmailDomainRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CreateSenderEmailMutation implements MutationInterface
{
    public const ALREADY_EXIST = 'ALREADY_EXIST';
    public const INVALID_DOMAIN = 'INVALID_DOMAIN';

    private EntityManagerInterface $em;
    private SenderEmailDomainRepository $domainRepository;

    public function __construct(
        EntityManagerInterface $em,
        SenderEmailDomainRepository $domainRepository
    ) {
        $this->em = $em;
        $this->domainRepository = $domainRepository;
    }

    public function __invoke(Argument $input): array
    {
        try {
            $this->checkDomainExists($input->offsetGet('domain'));
            $senderEmail = $this->createSenderEmail($input);

            $this->em->persist($senderEmail);
            $this->em->flush();
        } catch (UniqueConstraintViolationException $exception) {
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
            ->setDomain($input->offsetGet('domain'));
    }

    private function checkDomainExists(string $domain): void
    {
        if (0 === $this->domainRepository->count(['value' => $domain])) {
            throw new UserError(self::INVALID_DOMAIN);
        }
    }
}
