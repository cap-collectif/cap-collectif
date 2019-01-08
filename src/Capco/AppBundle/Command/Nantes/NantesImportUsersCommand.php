<?php

namespace Capco\AppBundle\Command\Nantes;

use Capco\AppBundle\Manager\MediaManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
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

class NantesImportUsersCommand extends ContainerAwareCommand
{
    protected const USERS_BATCH_SIZE = 25;

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
        $this->setName('capco:import:nantes-users')->setDescription('Import users from nantes');
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
        $stopwatch->start('import');
        $this->disableListeners($output);
        $this->importUsers($output);
        $this->enableListeners($output);
        $event = $stopwatch->stop('import');
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
        $output->writeln('<info>Importing users...</info>');
        $count = 1;
        $progress = new ProgressBar($output, \count($this->users));
        foreach ($this->users as $key => $userRow) {
            $firstName =
                '' === $userRow['firstName'] || !$userRow['firstName']
                    ? null
                    : $userRow['firstName'];
            $lastName =
                '' === $userRow['lastName'] || !$userRow['lastName'] ? null : $userRow['lastName'];
            $email =
                '' === $userRow['cnmEmail'] || !$userRow['cnmEmail']
                    ? 'test@mail' . $key . '.com'
                    : $userRow['cnmEmail'];
            $userExist = $this->em->getRepository(User::class)->findOneByEmail($email);
            if (!$userExist) {
                $user /* for test only, because datas samples were corrupted
                ->setEmailCanonical($userRow['cnmEmail'] . '@mail' . $key . '.com')
                ->setEmail($userRow['cnmEmail'] . '@mail' . $key . '.com')
                */ = (new User())
                    ->setFirstname($firstName)
                    ->setLastname($lastName)
                    ->setUsername($userRow['nickName'] ?? $key)
                    ->setPassword('')
                    ->setOpenId($userRow['id'])
                    ->setEmailCanonical($email)
                    ->setEmail($email)
                    ->setEnabled(true)
                    ->setCreatedAt(new \DateTime($userRow['createdDate']))
                    ->setDateOfBirth(new \DateTime($userRow['j:birthDate']));
                //Waiting for users files
                try {
                    $filePath =
                        $this->getContainer()->getParameter('kernel.root_dir') .
                        '/../nantesCo/users';
                    if ('' !== $userRow['pictures']) {
                        $file = $filePath . $userRow['pictures'];
                        if (file_exists($file)) {
                            $extension = '.' . explode('/', mime_content_type($file))[1];
                            rename(
                                $filePath . $userRow['pictures'],
                                $filePath . $userRow['pictures'] . $extension
                            );
                            $file = $filePath . $userRow['pictures'] . $extension;
                        } else {
                            if (file_exists($file . '.jpg')) {
                                $file = $file . '.jpg';
                            } elseif (file_exists($file . '.jpeg')) {
                                $file = $file . '.jpeg';
                            } elseif (file_exists($file . '.png')) {
                                $file = $file . '.png';
                            }
                        }
                        $avatar = $this->getContainer()
                            ->get(MediaManager::class)
                            ->createImageFromPath($file);
                        $user->setMedia($avatar);
                    }
                } catch (\Exception $exception) {
                    $output->writeln(
                        '<info>' . $file . '</info> not found. Set default image instead...'
                    );
                }
                $this->em->persist($user);
                if (0 === $count % self::USERS_BATCH_SIZE) {
                    $this->em->flush();
                    $this->em->clear();
                }
                //$this->printMemoryUsage($output);
                $progress->advance();
                ++$count;
            } else {
                $progress->advance();
                ++$count;
            }
        }
        unset($count);
        $this->em->flush();
        $this->em->clear();
        $progress->finish();
        $this->enableListeners($output);
        $output->writeln('<info>Successfully imported users...</info>');
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

    private function disableListeners(OutputInterface $output): void
    {
        foreach ($this->em->getEventManager()->getListeners() as $event => $listeners) {
            $this->events = $this->em->getEventManager()->getListeners();
            foreach ($listeners as $key => $listener) {
                if (
                    \is_string($listener) ||
                    \in_array(\get_class($listener), self::LISTENERS_WHITELIST, true)
                ) {
                    continue;
                }
                if (method_exists($listener, 'getSubscribedEvents')) {
                    $this->em
                        ->getEventManager()
                        ->removeEventListener($listener->getSubscribedEvents(), $listener);
                    $output->writeln('Disabled <info>' . \get_class($listener) . '</info>');
                }
            }
        }
    }

    private function enableListeners(OutputInterface $output): void
    {
        foreach ($this->events as $event => $listeners) {
            foreach ($listeners as $key => $listener) {
                if (method_exists($listener, 'getSubscribedEvents')) {
                    $this->em
                        ->getEventManager()
                        ->addEventListener($listener->getSubscribedEvents(), $listener);
                    $output->writeln('Enabled <info>' . \get_class($listener) . '</info>');
                }
            }
        }
    }
}
