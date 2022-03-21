<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateSmsCreditMutation implements MutationInterface
{
    public const SMS_CREDIT_NOT_FOUND = 'SMS_CREDIT_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');
        $amount = $input->offsetGet('amount');

        $smsCredit = $this->globalIdResolver->resolve($id, $viewer);
        if (!$smsCredit) {
            return ['smsCredit' => null, 'errorCode' => self::SMS_CREDIT_NOT_FOUND];
        }

        $smsCredit->setAmount($amount);
        $this->em->flush();

        return ['smsCredit' => $smsCredit, 'errorCode' => null];
    }
}
