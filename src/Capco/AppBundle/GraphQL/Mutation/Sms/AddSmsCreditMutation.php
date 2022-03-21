<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Form\SmsCreditType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class AddSmsCreditMutation implements MutationInterface
{
    public const ORDER_ALREADY_PROCESSED = 'ORDER_ALREADY_PROCESSED';
    public const SMS_ORDER_NOT_FOUND = 'SMS_ORDER_NOT_FOUND';

    private EntityManagerInterface $em;
    private SmsNotifier $notifier;
    private SmsCreditRepository $smsCreditRepository;
    private GlobalIdResolver $globalIdResolver;
    private FormFactoryInterface $formFactory;

    public function __construct(
        EntityManagerInterface $em,
        SmsNotifier $notifier,
        SmsCreditRepository $smsCreditRepository,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory
    ) {
        $this->em = $em;
        $this->notifier = $notifier;
        $this->smsCreditRepository = $smsCreditRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $smsOrderId = $input->offsetGet('smsOrder');

        /** * @var SmsOrder $smsOrder  */
        $smsOrder = $this->globalIdResolver->resolve($smsOrderId, $viewer);

        if (!$smsOrder) {
            return ['errorCode' => self::SMS_ORDER_NOT_FOUND];
        }

        $values = $input->getArrayCopy();

        $smsCredit = new SmsCredit();
        $form = $this->formFactory->create(SmsCreditType::class, $smsCredit);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $errors = $form->getErrors(true, true);
            foreach ($errors as $error) {
                if ($error->getMessageTemplate() === 'This value is already used.') {
                    return ['errorCode' => self::ORDER_ALREADY_PROCESSED];
                }
            }
        }

        $smsOrder->setIsProcessed(true);
        $this->em->persist($smsOrder);
        $this->em->persist($smsCredit);
        $this->em->flush();

        $smsCreditsCount = $this->smsCreditRepository->countAll();

        if ($smsCreditsCount > 0) {
            $this->notifier->onRefillSmsCredit($smsCredit);
        } else {
            $this->notifier->onInitialSmsCredit($smsCredit);
        }

        return ['smsCredit' => $smsCredit];
    }
}
