<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\SmsRemainingCreditEmailAlert;
use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\SmsRemainingCreditEmailAlertRepository;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SendSmsCreditConsumptionAlertCommand extends Command
{
    private EntityManagerInterface $em;
    private SmsCreditRepository $smsCreditRepository;
    private SmsRemainingCreditEmailAlertRepository $smsRemainingCreditEmailAlertRepository;
    private SmsNotifier $notifier;
    private SmsAnalyticsHelper $smsAnalyticsHelper;

    public function __construct(
        string $name,
        EntityManagerInterface $em,
        SmsCreditRepository $smsCreditRepository,
        SmsRemainingCreditEmailAlertRepository $smsRemainingCreditEmailAlertRepository,
        SmsNotifier $notifier,
        SmsAnalyticsHelper $smsAnalyticsHelper
    )
    {
        parent::__construct($name);
        $this->em = $em;
        $this->smsCreditRepository = $smsCreditRepository;
        $this->smsRemainingCreditEmailAlertRepository = $smsRemainingCreditEmailAlertRepository;
        $this->notifier = $notifier;
        $this->smsAnalyticsHelper = $smsAnalyticsHelper;
    }

    protected function configure()
    {
        $this->setName('capco:sms-credit-consumption-alert')
            ->setDescription('send email alert if sms credit is running low')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $remainingCreditsAmount = $this->smsAnalyticsHelper->getRemainingCreditsAmount();

        if (!$remainingCreditsAmount) {
            $output->writeln('no remaining credits found');
            return 1;
        }

        $status = $this->smsAnalyticsHelper->getRemainingCreditsStatus();
        $error = $this->sendEmailNotification($status, $remainingCreditsAmount);

        if ($error) {
            $output->writeln($error);
            return 1;
        }

        return 0;
    }

    private function sendEmailNotification(string $status, int $remainingCreditsAmount): ?string
    {
        $mostRecentRefill = $this->smsCreditRepository->findMostRecent();
        // we check if we already sent an alert for the most recent credit re-fill and this status
        $emailAlreadySent = $this->smsRemainingCreditEmailAlertRepository->findOneBy(["status" => $status, "smsCredit" => $mostRecentRefill]);

        $percent = null;
        if ($emailAlreadySent) return 'email already sent for this credit re-fill and status';
        if ($status === RemainingSmsCreditStatus::IDLE) return 'status IDLE';
        if ($status === RemainingSmsCreditStatus::LOW) $percent = 75;
        if ($status === RemainingSmsCreditStatus::VERY_LOW) $percent = 90;
        if ($status === RemainingSmsCreditStatus::TOTAL) $percent = 100;

        $this->notifier->onAlertSmsConsumedCredit($remainingCreditsAmount, $percent);

        $emailAlert = new SmsRemainingCreditEmailAlert();
        $emailAlert->setStatus($status);
        $emailAlert->setSmsCredit($mostRecentRefill);

        $this->em->persist($emailAlert);
        $this->em->flush();

        return null;
    }
}
