<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class CreateSmsOrderMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private SmsOrderRepository $smsOrderRepository;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        SmsOrderRepository $smsOrderRepository,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->smsOrderRepository = $smsOrderRepository;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $input): array
    {
        $smsOrdersCount = $this->smsOrderRepository->countAll();

        $amount = $input->offsetGet('amount');
        $smsOrder = new SmsOrder();
        $smsOrder->setAmount($amount);

        $this->em->persist($smsOrder);
        $this->em->flush();

        $messageType = $smsOrdersCount > 0 ? 'sms_credit.refill_order' : 'sms_credit.initial_order';

        $this->publisher->publish(
            $messageType,
            new Message(
                json_encode([
                    'smsOrderId' => $smsOrder->getId(),
                ])
            )
        );

        return ['smsOrder' => $smsOrder];
    }
}
