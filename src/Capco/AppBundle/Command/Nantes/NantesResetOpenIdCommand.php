<?php

namespace Capco\AppBundle\Command\Nantes;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\Manager\MediaManager;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Faker\Generator;
use Gedmo\Sluggable\SluggableListener;
use Gedmo\Timestampable\TimestampableListener;
use League\Csv\Reader;
use Sonata\EasyExtendsBundle\Mapper\DoctrineORMMapper;
use Sonata\MediaBundle\Listener\ORM\MediaEventSubscriber;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class NantesResetOpenIdCommand extends ContainerAwareCommand
{
    protected const USERS_BATCH_SIZE = 500;

    protected const USERS_FILE = 'utilisateurs.csv';

    protected const LISTENERS_WHITELIST = [
        SluggableListener::class,
        MediaEventSubscriber::class,
        DoctrineORMMapper::class,
        TimestampableListener::class,
    ];

    protected const USER_HEADER = [
        'id',
        'firstName',
        'lastName',
        'cnmEmail',
        'cnmid',
        'nickName',
        'j:birthDate',
        'pictures',
        'cguAgree',
        'concertationList',
        'districtList',
        'unknown',
        'votedList',
        'createdDate',
        'lastModifiedDate',
    ];

    /** @var EntityManagerInterface */
    protected $em;

    protected $users = [];

    private $events;

    protected function configure(): void
    {
        $this->setName('capco:import:nantes-users-reset')->setDescription(
            'Import users from nantes'
        );
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setSQLLogger(null);
        $this->users = $this->createUsers();
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $stopwatch = new Stopwatch();
        $stopwatch->start('resetOpenId');
        $this->importUsers($output);
        $event = $stopwatch->stop('resetOpenId');
        $output->writeln(
            "\n<info>Elapsed time : " .
                round($event->getDuration() / 1000 / 60, 2) .
                " minutes. \n Memory usage : " .
                round($event->getMemory() / 1000000, 2) .
                ' MB</info>'
        );
    }

    protected function createUsers(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/' . self::USERS_FILE);
        $csv->setDelimiter(';');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::USER_HEADER);
        $users = [];
        foreach ($iterator as $item) {
            $users[] = $item;
        }

        return $users;
    }

    protected function importUsers(OutputInterface $output): void
    {
        $output->writeln('<info>Resetting users openId...</info>');
        $count = 1;
        $progress = new ProgressBar($output, \count($this->users));
        foreach ($this->users as $key => $userRow) {
            $userInDb = $this->em
                ->getRepository(User::class)
                ->findOneBy(['openId' => $userRow['id']]);
            $userInDb->setOpenId($userRow['cnmid']);
            $this->em->persist($userInDb);
            if (0 === $count % self::USERS_BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear(User::class);
                $this->printMemoryUsage($output);
            }
            $progress->advance();
            ++$count;
        }
        unset($count);
        $this->em->flush();
        $this->em->clear(User::class);
        $progress->finish();
        $this->enableListeners($output);
        $output->writeln('<info>Successfully reseted Users OpenId...</info>');
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        $output->write("\n");
        $output->writeln(
            sprintf(
                'Memory usage (currently) %dKB/ (max) %dKB',
                round(memory_get_usage(true) / 1024),
                memory_get_peak_usage(true) / 1024
            )
        );
    }
}
