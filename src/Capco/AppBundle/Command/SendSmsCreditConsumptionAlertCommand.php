<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\SmsRemainingCreditEmailAlert;
use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\SmsRemainingCreditEmailAlertRepository;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class SendSmsCreditConsumptionAlertCommand extends Command
{
    private EntityManagerInterface $em;
    private SmsCreditRepository $smsCreditRepository;
    private SmsRemainingCreditEmailAlertRepository $smsRemainingCreditEmailAlertRepository;
    private SmsAnalyticsHelper $smsAnalyticsHelper;
    private Publisher $publisher;

    public function __construct(
        string $name,
        EntityManagerInterface $em,
        SmsCreditRepository $smsCreditRepository,
        SmsRemainingCreditEmailAlertRepository $smsRemainingCreditEmailAlertRepository,
        SmsAnalyticsHelper $smsAnalyticsHelper,
        Publisher $publisher
    ) {
        parent::__construct($name);
        $this->em = $em;
        $this->smsCreditRepository = $smsCreditRepository;
        $this->smsRemainingCreditEmailAlertRepository = $smsRemainingCreditEmailAlertRepository;
        $this->smsAnalyticsHelper = $smsAnalyticsHelper;
        $this->publisher = $publisher;
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
        $emailAlreadySent = $this->smsRemainingCreditEmailAlertRepository->findOneBy(['status' => $status, 'smsCredit' => $mostRecentRefill]);

        $percent = null;
        if ($emailAlreadySent) {
            return 'email already sent for this credit re-fill and status';
        }
        if (RemainingSmsCreditStatus::IDLE === $status) {
            return 'status IDLE';
        }
        if (RemainingSmsCreditStatus::LOW === $status) {
            $percent = 75;
        }
        if (RemainingSmsCreditStatus::VERY_LOW === $status) {
            $percent = 90;
        }
        if (RemainingSmsCreditStatus::TOTAL === $status) {
            $percent = 100;
        }

        $this->publisher->publish(
            'sms_credit.alert_consumed_credit',
            new Message(
                json_encode([
                    'remainingCreditsAmount' => $remainingCreditsAmount,
                    'percent' => $percent,
                ])
            )
        );

        $emailAlert = new SmsRemainingCreditEmailAlert();
        $emailAlert->setStatus($status);
        $emailAlert->setSmsCredit($mostRecentRefill);

        $this->em->persist($emailAlert);
        $this->em->flush();

        return null;
    }
}
