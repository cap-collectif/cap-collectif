<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\MailingListUser;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\UserGroup;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * This command does not test the case: Emailing campaign for a project
 * It could be done but it would be very complex (cf : Capco\AppBundle\Mailer\Recipient\ProjectRecipientsFetcher).
 */
#[AsCommand(
    name: 'capco:emailing-campaign:generate-large-dataset',
    description: 'Generates a huge amount of data to test the emailing campaing feature on a large scale',
)]
class CapcoEmailingCampaignGenerateLargeDatasetCommand extends Command
{
    private const BATCH_SIZE = 200;
    private const MAILING_LIST = 'Big-mailing-list';
    private const USER_GROUP = 'Big-user-group';
    private const EMAILING_CAMPAIGN = 'Big-emailing-campaign';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly string $env,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this
            ->addArgument(
                name: 'nbUsers',
                mode: InputArgument::REQUIRED,
                description: 'The number of users to create.'
            )
            ->addArgument(
                name: 'emailBase',
                mode: InputArgument::REQUIRED,
                description: 'The first part of the email. The command will append +n@cap-collectif.com to create unique emails, with n being a number.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ('prod' === $this->env) {
            $io->error('It looks like you are running this command on production. DO NOT DO THAT!');

            return Command::FAILURE;
        }

        $nbUsers = $input->getArgument('nbUsers');
        if (!ctype_digit((string) $nbUsers)) {
            $io->error('The nbUsers argument must be a positive integer.');

            return Command::FAILURE;
        }

        $emailBase = $input->getArgument('emailBase');

        $mailingList = $this->em->getRepository(MailingList::class)->findOneBy(['name' => self::MAILING_LIST]);
        if (null === $mailingList) {
            $mailingList = (new MailingList())
                ->setName(self::MAILING_LIST)
            ;
        }

        $group = $this->em->getRepository(Group::class)->findOneBy(['title' => self::USER_GROUP]);
        if (null === $group) {
            $group = (new Group())
                ->setTitle(self::USER_GROUP)
                ->setDescription('Big group')
            ;
        }

        $emailingCampaign = $this->em->getRepository(EmailingCampaign::class)->findOneBy(['name' => self::EMAILING_CAMPAIGN]);
        if (null === $emailingCampaign) {
            $emailingCampaign = (new EmailingCampaign())
                ->setName(self::EMAILING_CAMPAIGN)
                ->setContent('This is the content of the emailing campaign.')
                ->setObject('Big big campaign')
                ->setMailingList($mailingList)
                ->setSenderEmail('no-reply@cap-collectif.com')
                ->setSenderName('Cap-Collectif')
            ;
        }

        $this->em->persist($mailingList);
        $this->em->persist($emailingCampaign);
        $this->em->persist($group);
        $this->em->flush();

        $io->progressStart($nbUsers);
        for ($i = 0; $i < $nbUsers; ++$i) {
            $email = sprintf('%s+%s@cap-collectif.com', $emailBase, $i);
            $fistName = sprintf('MailJet-%s', $i);

            // we make 2/3 of contributors as users and 1/3 as participants
            if (0 === $i % 3) {
                $contributor = (new Participant())
                    ->setEmail($email)
                    ->setUsername(sprintf('mailjet_participant_%s', $i))
                    ->setConsentInternalCommunication(true)
                    ->setFirstname($fistName)
                    ->setLastname(sprintf('Participant-%s', $i))
                    ->setToken(sprintf('fake_token_%d', $i))
                ;
            } else {
                $contributor = (new User())
                    ->setEmail($email)
                    ->setEnabled(true)
                    ->setUsername(sprintf('mailjet_user_%s', $i))
                    ->setConsentInternalCommunication(true)
                    ->setFirstname($fistName)
                    ->setLastname(sprintf('User-%s', $i))
                    ->setSalt('avqhrb1jee8gw8c48gw8c8g4w4w4okk')
                    ->setPassword('$2y$13$avqhrb1jee8gw8c48gw8cuLpm5DfMXyE2mOJIAXgkxnxnYAiwldNe')
                ;
                $userGroup = (new UserGroup())
                    ->setGroup($group)
                    ->setUser($contributor)
                ;
                $group->addUserGroup($userGroup);
                $this->em->persist($userGroup);
            }

            $mailingListUser = (new MailingListUser())
                ->setContributor($contributor)
                ->setMailingList($mailingList)
            ;

            $this->em->persist($contributor);
            $this->em->persist($mailingListUser);
            $this->em->persist($mailingList);

            if (($i % self::BATCH_SIZE) === 0) {
                $this->em->flush();
                $this->em->clear();
                $mailingList = $this->em->getRepository(MailingList::class)->findOneBy(['name' => self::MAILING_LIST]);
                $group = $this->em->getRepository(Group::class)->findOneBy(['title' => self::USER_GROUP]);
            }
            $io->progressAdvance();
        }

        $this->em->flush();
        $io->progressFinish();

        return Command::SUCCESS;
    }
}
