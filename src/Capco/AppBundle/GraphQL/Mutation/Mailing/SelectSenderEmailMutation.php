<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\SenderEmail;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SenderEmailRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class SelectSenderEmailMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_SENDER_EMAIL = 'UNKNOWN_SENDER_EMAIL';

    public function __construct(private readonly EntityManagerInterface $em, private readonly SenderEmailRepository $repository)
    {
    }

    public function __invoke(Argument $input)
    {
        $this->formatInput($input);

        try {
            $senderEmail = $this->getSenderEmail($input);
            if (!$senderEmail->isDefault()) {
                $previousDefault = $this->getDefaultSenderEmail();
                $previousDefault->setIsDefault(false);
                $senderEmail->setIsDefault(true);
                $this->em->flush();
            }
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return ['senderEmail' => $senderEmail];
    }

    private function getSenderEmail(Argument $input): SenderEmail
    {
        $id = GlobalId::fromGlobalId($input->offsetGet('senderEmail'))['id'];
        if ($id) {
            $senderEmail = $this->repository->find($id);
            if ($senderEmail) {
                return $senderEmail;
            }
        }

        throw new UserError(self::UNKNOWN_SENDER_EMAIL);
    }

    private function getDefaultSenderEmail(): SenderEmail
    {
        return $this->repository->findOneBy(['isDefault' => true]);
    }
}
