<?php

namespace Capco\AppBundle\Command\Paris;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Cocur\Slugify\Slugify;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Faker\Generator;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ParisImportUsersCommand extends ContainerAwareCommand
{
    protected const USERS_BATCH_SIZE = 500;

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
        $this
            ->setName('capco:import:paris-users')
            ->setDescription('Import users from paris');
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $this->em->getConnection()->getConfiguration()->setSQLLogger(null);
        $this->users = $this->createUsers();
        $this->faker = Factory::create();
        $this->disableListeners($output);
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $stopwatch = new Stopwatch();
        $stopwatch->start('import');
        $this->importUsers($output);
        $this->enableListeners($output);
        $event = $stopwatch->stop('import');
        $output->writeln("\n<info>Elapsed time : " . round($event->getDuration() / 1000 / 60, 2) . " minutes. \n Memory usage : " . round($event->getMemory() / 1000000, 2) . ' MB</info>');
    }

    protected function createUsers(): array
    {
        $csv = Reader::createFromPath(__DIR__ . '/paris_users.csv');
        $iterator = $csv->setOffset(1)->fetchAssoc(self::USER_HEADER);
        $users = [];
        foreach ($iterator as $item) {
            $users[] = $item;
        }

        return $users;
    }

    protected function getUserTypes(OutputInterface $output): Collection
    {
        $slug = Slugify::create();
        foreach (self::PROFILES_TYPES as $key => $value) {
            if (!$this->em->getRepository(UserType::class)->findOneBy(['name' => $value])) {
                $type = (new UserType())
                    ->setName($value)
                    ->setSlug($slug->slugify($value))
                    ->setCreatedAt(new \DateTime());
                $this->em->persist($type);
                $this->em->flush();
            }
        }
        foreach (self::PROFILES_TYPES_RATTACHEMENT as $agentName) {
            if (!$this->em->getRepository(UserType::class)->findOneBy(['name' => $agentName])) {
                $type = (new UserType())
                    ->setName($agentName)
                    ->setSlug($slug->slugify($agentName))
                    ->setCreatedAt(new \DateTime());
                $this->em->persist($type);
                $this->em->flush();
            }
        }
        $this->em->clear(UserType::class);

        return new ArrayCollection($this->em->getRepository(UserType::class)->findAll());
    }

    protected function importUsers(OutputInterface $output): void
    {
        $output->writeln('<info>Importing users...</info>');
        $count = 1;
        $progress = new ProgressBar($output, \count($this->users));
        $types = $this->getUserTypes($output);
        foreach ($this->users as $user) {
            $type = $types->filter(function (UserType $type) use ($user) {
                if (!$user['user_type'] || 'p' === $user['user_type']) {
                    return 'Un particulier' === $type->getName();
                }
                if ($user['user_type_rattachement']) {
                    return $type->getName() === $user['user_type_rattachement'];
                }

                return $type->getName() === self::PROFILES_TYPES[$user['user_type']];
            })->first();
            $firstName = ('' === $user['firstname'] || !$user['firstname']) ? $this->faker->firstName : $user['firstname'];
            $lastName = ('' === $user['lastname'] || !$user['lastname']) ? $this->faker->lastName : $user['lastname'];
            $slug = Slugify::create();
            $user = (new User())
                ->setFirstname($firstName)
                ->setLastname($lastName)
                ->setUsername($user['name'])
                ->setPassword('')
                ->setEmailCanonical('' === $user['email'] ? $user['email_init'] : $user['email'])
                ->setEmail('' === $user['email'] ? $user['email_init'] : $user['email'])
                ->setAddress('' === $user['address'] ? null : $user['address'])
                ->setZipCode('' === $user['zipcode'] ? null : (int) $user['zipcode'])
                ->setSlug($slug->slugify($user['name']) . $count)
                ->setEnabled(true)
                ->setPhone($user['phone'])
                ->setUserType($type)
                ->setParisId('' === $user['email'] ? $user['email_init'] : $user['email'])
                ->setCreatedAt(new \DateTime($user['created_at']))
                ->setLastLogin(new \DateTime($user['last_login_at']))
                ->setDateOfBirth(new \DateTime($user['birthdate']))
            ;
            $this->em->persist($user);
            if (0 === $count % self::USERS_BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear(User::class);
                $this->em->clear(UserNotificationsConfiguration::class);
                $this->printMemoryUsage($output);
            }
            $progress->advance();
            ++$count;
        }
        unset($count);
        $this->em->flush();
        $this->em->clear();
        $progress->finish();
        $output->writeln('<info>Successfully imported users...</info>');
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        $output->write("\n");
        $output->writeln(sprintf('Memory usage (currently) %dKB/ (max) %dKB', round(memory_get_usage(true) / 1024), memory_get_peak_usage(true) / 1024));
    }

    private function disableListeners(OutputInterface $output): void
    {
        $this->events = $this->em->getEventManager()->getListeners();
        foreach ($this->em->getEventManager()->getListeners() as $event => $listeners) {
            foreach ($listeners as $key => $listener) {
                if (method_exists($listener, 'getSubscribedEvents')) {
                    $this->em->getEventManager()->removeEventListener($listener->getSubscribedEvents(), $listener);
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
                    $this->em->getEventManager()->addEventListener($listener->getSubscribedEvents(), $listener);
                    $output->writeln('Enabled <info>' . \get_class($listener) . '</info>');
                }
            }
        }
    }
}
