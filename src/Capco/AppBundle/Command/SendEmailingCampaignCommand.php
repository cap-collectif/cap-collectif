<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Mailer\EmailingCampaignSender;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
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

    public function __construct(
        EmailingCampaignSender $sender,
        EmailingCampaignRepository $repository,
        EntityManagerInterface $entityManager
    ) {
        $this->sender = $sender;
        $this->repository = $repository;
        $this->entityManager = $entityManager;

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
        $output->writeln(
            '<info>Sending EmailingCampaign ' . $emailingCampaign->getName() . '</info>'
        );

        try {
            $count = $this->sender->send($emailingCampaign);
            $this->persistAndFlush($emailingCampaign);
            $output->writeln("<info>Sent to ${count} recipients</info>");
        } catch (\Exception $exception) {
            $output->writeln('<error>' . $exception->getMessage() . '</error>');
        }
    }

    private function persistAndFlush(EmailingCampaign $emailingCampaign): void
    {
        $this->entityManager->persist($emailingCampaign);
        $this->entityManager->flush();
    }
}
