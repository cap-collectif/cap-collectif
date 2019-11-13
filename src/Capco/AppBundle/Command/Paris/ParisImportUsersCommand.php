<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\Manager\MediaManager;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Faker\Generator;
use Capco\AppBundle\Sluggable\SluggableListener;
use Gedmo\Timestampable\TimestampableListener;
use League\Csv\Reader;
use Sonata\EasyExtendsBundle\Mapper\DoctrineORMMapper;
use Sonata\MediaBundle\Listener\ORM\MediaEventSubscriber;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ParisImportUsersCommand extends ContainerAwareCommand
{
    protected const USERS_BATCH_SIZE = 500;

    protected const USERS_FILE = 'paris_users.csv';

    protected const LISTENERS_WHITELIST = [
        SluggableListener::class,
        MediaEventSubscriber::class,
        DoctrineORMMapper::class,
        TimestampableListener::class,
    ];

    protected const USER_HEADER = [
        'name',
        'phone',
        'firstname',
        'lastname',
        'user_type',
        'user_type_rattachement',
        'address',
        'zipcode',
        'password',
        'email',
        'email_init',
        'filename',
        'notification_type',
        'newsletter_subscription',
        'created_at',
        'last_login_at',
        'birthdate',
    ];

    protected const PROFILES_TYPES = [
        'p' => 'Un particulier',
        'a' => 'Un agent de la ville de Paris',
    ];

    protected const PROFILES_TYPES_RATTACHEMENT = [
        'Cabinet de la Maire',
        'Caisses des écoles',
        "CASVP : Centre d'Action social de la Ville de Paris",
        'DAC : Direction des Affaires culturelles',
        'DAJ : Direction des Affaires juridiques',
        'DASCO : Direction des Affaires scolaires',
        "DASES : Direction de l'Action sociale, de l'Enfance et de la Santé",
        'DDCT : Direction de la Démocratie, des Citoyens et des Territoires',
        "DDEEES : Direction du Développement économique , de l'Emploi et de l'Enseignement supérieur",
        "DEVE : Direction des Espaces verts et de l'Environnement",
        'DFA : Direction des Finances et des Achats',
        'DFPE : Direction des Familles et de la petite Enfance',
        "DICOM : Direction de l'Information et de la Communication",
        "DILT : Direction de l'Immobilier, de la Logistique et des Transports",
        'DJS : Direction de la Jeunesse et des Sports',
        "DLH : Direction du Logement et de l'Habitat",
        "DPA : Direction du Patrimoine et de l'Architecture",
        "DPE : Direction de la Propreté et de l'Eau",
        'DPP : Direction de la Prévention et de la Protection',
        'DRH : Direction des Ressources humaines',
        "DSTI : Direction des Systèmes et Technologies de l'Information",
        "DU : Direction de l'Urbanisme",
        'DVD : Direction de la Voirie et des Déplacements',
        'EPM : Paris Musées',
        'IG : Inspection générale',
        'SGVP : Secrétariat général de la Ville de Paris',
        "SG_Hors budget d'investissement",
        'SG_Hors compétence Ville',
        'SG_Projet existant ou prévu',
        'SG_Projet Imprécis',
    ];

    /** @var EntityManagerInterface */
    protected $em;

    /** @var Generator */
    protected $faker;

    protected $users = [];

    private $events;

    protected function configure(): void
    {
        $this->setName('capco:import:paris-users')->setDescription('Import users from paris');
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em
            ->getConnection()
            ->getConfiguration()
            ->setSQLLogger(null);
        $this->users = $this->createUsers();
        $this->faker = Factory::create();
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
        $iterator = $csv->setOffset(1)->fetchAssoc(self::USER_HEADER);
        $users = [];
        foreach ($iterator as $item) {
            $users[] = $item;
        }

        return $users;
    }

    protected function getUserTypes(): Collection
    {
        foreach (self::PROFILES_TYPES as $key => $value) {
            if (
                !$this->getContainer()
                    ->get(UserTypeRepository::class)
                    ->findOneBy(['name' => $value])
            ) {
                $type = (new UserType())->setName($value)->setCreatedAt(new \DateTime());
                $this->em->persist($type);
                $this->em->flush();
            }
        }
        foreach (self::PROFILES_TYPES_RATTACHEMENT as $agentName) {
            if (
                !$this->getContainer()
                    ->get(UserTypeRepository::class)
                    ->findOneBy(['name' => $agentName])
            ) {
                $type = (new UserType())->setName($agentName)->setCreatedAt(new \DateTime());
                $this->em->persist($type);
                $this->em->flush();
            }
        }
        $this->em->clear(UserType::class);

        return new ArrayCollection(
            $this->getContainer()
                ->get(UserTypeRepository::class)
                ->findAll()
        );
    }

    protected function importUsers(OutputInterface $output): void
    {
        $output->writeln('<info>Importing users...</info>');
        $count = 1;
        $progress = new ProgressBar($output, \count($this->users));
        $types = $this->getUserTypes();
        foreach ($this->users as $userRow) {
            $type = $types
                ->filter(function (UserType $type) use ($userRow) {
                    if (!$userRow['user_type'] || 'p' === $userRow['user_type']) {
                        return 'Un particulier' === $type->getName();
                    }
                    if ($userRow['user_type_rattachement']) {
                        return $type->getName() === $userRow['user_type_rattachement'];
                    }

                    return $type->getName() === self::PROFILES_TYPES[$userRow['user_type']];
                })
                ->first();
            $firstName =
                '' === $userRow['firstname'] || !$userRow['firstname']
                    ? null
                    : $userRow['firstname'];
            $lastName =
                '' === $userRow['lastname'] || !$userRow['lastname'] ? null : $userRow['lastname'];
            $email = '' === $userRow['email'] ? $userRow['email_init'] : $userRow['email'];
            $address = '' === $userRow['address'] ? null : $userRow['address'];
            $zipCode = '' === $userRow['zipcode'] ? null : $userRow['zipcode'];
            $user = (new User())
                ->setFirstname($firstName)
                ->setLastname($lastName)
                ->setUsername($userRow['name'])
                ->setPassword('')
                ->setEmailCanonical($email)
                ->setEmail($email)
                ->setAddress($address)
                ->setZipCode($zipCode)
                ->setEnabled(true)
                ->setPhone($userRow['phone'])
                ->setUserType($type)
                ->setParisId($email)
                ->setCreatedAt(new \DateTime($userRow['created_at']))
                ->setLastLogin(new \DateTime($userRow['last_login_at']))
                ->setDateOfBirth(new \DateTime($userRow['birthdate']));

            try {
                if (
                    '' !== $userRow['filename'] &&
                    file_exists(__DIR__ . '/images/' . $userRow['filename'])
                ) {
                    $avatar = $this->getContainer()
                        ->get(MediaManager::class)
                        ->createImageFromPath(__DIR__ . '/images/' . $userRow['filename']);
                    $user->setMedia($avatar);
                }
            } catch (\Exception $exception) {
                $output->writeln(
                    '<info>' .
                        $userRow['filename'] .
                        '</info> not found. Set default image instead...'
                );
            }
            if ('' === $userRow['notification_type']) {
                $user->setNotificationsConfiguration(
                    (new UserNotificationsConfiguration())->setOnProposalCommentMail(false)
                );
                $output->write("\n");
                $output->writeln(
                    'Disabled on proposal comment notifications for user <info>' .
                        $user->getUsername() .
                        '</info>'
                );
            }
            $this->em->persist($user);
            if ('' !== $userRow['newsletter_subscription']) {
                $newsletter = (new NewsletterSubscription())
                    ->setCreatedAt(new \DateTime($userRow['newsletter_subscription']))
                    ->setIsEnabled(true)
                    ->setEmail($email);
                $this->em->persist($newsletter);
            }
            if (0 === $count % self::USERS_BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear(User::class);
                $this->em->clear(UserNotificationsConfiguration::class);
                $this->em->clear(NewsletterSubscription::class);
                $this->em->clear(Media::class);
                $this->printMemoryUsage($output);
            }
            $progress->advance();
            ++$count;
        }
        unset($count);
        $this->em->flush();
        $this->em->clear(User::class);
        $this->em->clear(UserNotificationsConfiguration::class);
        $this->em->clear(NewsletterSubscription::class);
        $this->em->clear(Media::class);
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
