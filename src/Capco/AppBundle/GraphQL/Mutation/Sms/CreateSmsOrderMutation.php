<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateSmsOrderMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private SmsNotifier $notifier;
    private SmsOrderRepository $smsOrderRepository;

    public function __construct(
        EntityManagerInterface $em,
        SmsNotifier $notifier,
        SmsOrderRepository $smsOrderRepository
    ) {
        $this->em = $em;
        $this->notifier = $notifier;
        $this->smsOrderRepository = $smsOrderRepository;
    }

    public function __invoke(Argument $input): array
    {
        $amount = $input->offsetGet('amount');
        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $this->em->persist($smsOrder);
        $this->em->flush();

        $smsOrdersCount = $this->smsOrderRepository->countAll();

        if ($smsOrdersCount > 0) {
            $this->notifier->onRefillSmsOrder($smsOrder);
        } else {
            $this->notifier->onCreateSmsOrder($smsOrder);
        }

        return ['smsOrder' => $smsOrder];
    }
}
