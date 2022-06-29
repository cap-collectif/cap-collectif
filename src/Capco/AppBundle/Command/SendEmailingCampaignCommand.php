<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Mailer\EmailingCampaignSender;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Slack\OmarDjinn;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class SendEmailingCampaignCommand extends Command
{
    private EmailingCampaignSender $sender;
    private EmailingCampaignRepository $repository;
    private EntityManagerInterface $entityManager;
    private OmarDjinn $omarDjinn;

    public function __construct(
        EmailingCampaignSender $sender,
        EmailingCampaignRepository $repository,
        EntityManagerInterface $entityManager,
        OmarDjinn $omarDjinn
    ) {
        $this->sender = $sender;
        $this->repository = $repository;
        $this->entityManager = $entityManager;
        $this->omarDjinn = $omarDjinn;

        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:send-emailing-campaign')
            ->addOption(
                'time',
                null,
                InputOption::VALUE_OPTIONAL,
                '/!\ Should be used for CI only /!\ .The relative time you want to send email.',
                'now'
            )
            ->setDescription('Send all emailing campaigns planned with past date.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        foreach ($this->getEmailingCampaignsToBeSend($input) as $emailingCampaign) {
            $this->send($emailingCampaign, $output);
        }

        return 0;
    }

    private function getEmailingCampaignsToBeSend(InputInterface $input): array
    {
        $dateTime = new \DateTime($input->getOption('time'));

        return $this->repository->findPlanned($dateTime);
    }

    private function send(EmailingCampaign $emailingCampaign, OutputInterface $output): void
    {
        $emailingCampaign->setStatus(EmailingCampaignStatus::SENDING);
        $this->persistAndFlush($emailingCampaign);
        $this->logBefore($output, $emailingCampaign);

        try {
            $count = $this->sender->send($emailingCampaign);
            $this->persistAndFlush($emailingCampaign);
            $this->logAfter($output, $count);
        } catch (\Exception $exception) {
            $this->logFail($output, $exception);
        }
    }

    private function logBefore(OutputInterface $output, EmailingCampaign $emailingCampaign): void
    {
        $output->writeln(
            '<info>Sending EmailingCampaign ' . $emailingCampaign->getName() . '</info>'
        );
        $this->omarDjinn->sendBefore($emailingCampaign);
    }

    private function logAfter(OutputInterface $output, int $count): void
    {
        $output->writeln("<info>Sent to ${count} recipients</info>");
        $this->omarDjinn->sendAfter($count);
    }

    private function logFail(OutputInterface $output, \Exception $exception): void
    {
        $output->writeln('<error>' . $exception->getMessage() . '</error>');
        $this->omarDjinn->sendFail();
    }

    private function persistAndFlush(EmailingCampaign $emailingCampaign): void
    {
        $this->entityManager->persist($emailingCampaign);
        $this->entityManager->flush();
    }
}
