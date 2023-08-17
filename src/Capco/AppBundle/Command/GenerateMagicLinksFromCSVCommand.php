<?php

declare(strict_types=1);

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\UserBundle\Authenticator\Dto\MagicLinkPayload;
use Capco\UserBundle\Authenticator\MagicLinkAuthenticator;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Security\Core\User\UserEmailProvider;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use SplFileObject;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class GenerateMagicLinksFromCSVCommand extends Command
{
    private const SUCCESS = 0;
    private const ERROR = 1;
    private const FILE_FOLDER = '/public/magiclinks/';

    private UserEmailProvider $userProvider;
    private EntityManagerInterface $em;
    private KernelInterface $kernel;
    private UserRepository $userRepository;
    private SymfonyStyle $style;
    private UserPasswordEncoderInterface $passwordEncoder;
    private ConfigFileSystem $filesystem;
    private RouterInterface $router;
    private string $absoluteFilePath;

    private array $users = [];
    private array $newUsers = [];
    private array $generatedUsernames = [];
    private int $newMagicLinksCount = 0;
    private array $unHandledUsers = [];

    public function __construct(
        UserEmailProvider $userProvider,
        EntityManagerInterface $em,
        KernelInterface $kernel,
        UserRepository $userRepository,
        UserPasswordEncoderInterface $passwordEncoder,
        ConfigFileSystem $filesystem,
        RouterInterface $router
    ) {
        parent::__construct();
        $this->userProvider = $userProvider;
        $this->em = $em;
        $this->kernel = $kernel;
        $this->userRepository = $userRepository;
        $this->passwordEncoder = $passwordEncoder;
        $this->filesystem = $filesystem;
        $this->router = $router;
    }

    public function execute(InputInterface $input, OutputInterface $output)
    {
        $this->style = new SymfonyStyle($input, $output);
        $this->style->newLine();
        $this->style->title('Generate magic links from CSV file');

        $filePath = $input->getArgument('filePath');
        $this->absoluteFilePath = $this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '.csv';
        if (!file_exists($this->absoluteFilePath)) {
            $this->style->error('File not found');

            exit;
        }

        $file = $this->readFile($filePath);
        $this->style->definitionList(
            ['File path' => $input->getArgument('filePath')],
            ['Number of users to create' => $this->getNewUsersCount($file)]
        );

        if ([] !== $this->newUsers) {
            $confirm = $this->style->confirm('Do you wish to continue?');
            $this->style->caution('This may take a while due to password encoding.');
            if (!$confirm) {
                $this->style->warning('Command aborted');

                return self::ERROR;
            }

            try {
                $this->createNewUsers();
            } catch (\Throwable $th) {
                $this->style->error($th->getMessage());

                return self::ERROR;
            }
        } else {
            $this->style->warning('No new users to create, skipping.');
        }

        $this->style->definitionList(
            ['Number of magic links to create' => $this->getNewMagicLinksCount()]
        );

        $confirm = $this->style->confirm('Do you wish to continue?');
        if (!$confirm) {
            $this->style->warning('Command aborted');

            return self::ERROR;
        }

        try {
            $newData = $this->createNewMagicLinks();
            $this->insertDataIntoFile($filePath, $newData);
        } catch (\Throwable $th) {
            $this->style->error($th->getMessage());
            $this->style->error($th->getTraceAsString());

            return self::ERROR;
        }

        return self::SUCCESS;
    }

    protected function configure()
    {
        $this
            ->setName('capco:generate:magiclinks')
            ->setDescription('Generate magic links from CSV file')
            ->setHelp('This command allows you to generate magic links from CSV file')
            ->addArgument('filePath', InputArgument::REQUIRED, 'Please provide the path of the file you want to use.')
        ;
    }

    private function readFile(string $filePath): SplFileObject
    {
        $file = new SplFileObject($this->absoluteFilePath);
        $file->setFlags(\SplFileObject::READ_CSV);
        $file->setCsvControl(',');

        $this->style->section('Reading file');

        return $file;
    }

    private function getNewUsersCount(SplFileObject $file): int
    {
        $header = false;
        $count = 0;
        foreach ($file as $row) {
            if (false === $header) {
                $header = true;

                continue;
            }

            if (null === $this->userProvider->findUser($row[0])) {
                ++$count;
                $this->newUsers[] = $row;
            }
        }

        return $count;
    }

    private function getNewMagicLinksCount(): int
    {
        $this->users = $this->userRepository->findAllNonAdmin();
        $this->newMagicLinksCount = \count($this->users);

        return $this->newMagicLinksCount;
    }

    private function createNewUsers(): void
    {
        $this->style->section('Creating new users');
        $this->style->progressStart(\count($this->newUsers));
        $passwords = [];
        $count = 0;
        foreach ($this->newUsers as $row) {
            $password = $this->generateUniquePassword($passwords);
            $user = new User();

            $user
                ->setEmail($row[0])
                ->setUsername($this->generateUniqueUsername())
                ->setPassword($this->passwordEncoder->encodePassword($user, $password))
                ->setEnabled(true)
                ->addRole(UserRole::ROLE_USER)
            ;

            $this->em->persist($user);
            ++$count;
            if (0 === $count % 10) {
                $this->em->flush();
                $this->em->clear();
            }
            $this->style->progressAdvance(1);
        }

        $this->em->flush();
        $this->em->clear();
        $this->style->progressFinish();
        $this->style->definitionList(
            ['New usernames' => implode(',', $this->generatedUsernames)]
        );
    }

    private function generateUniquePassword(array &$passwords, int $maxRetries = 100): string
    {
        if (\in_array($password = bin2hex(openssl_random_pseudo_bytes(4)), $passwords)) {
            return $this->generateUniquePassword($passwords, --$maxRetries);
        }

        $passwords[] = $password;

        if ($maxRetries < 0) {
            throw new \Exception('Could not generate unique password');
        }

        return $password;
    }

    private function generateUniqueUsername(int $maxRetries = 100): string
    {
        $userName = str_split('YXXXYYXX');
        foreach ($userName as &$letter) {
            if ('Y' === $letter) {
                $letter = $this->getRandomLetter();

                continue;
            }

            if ('X' === $letter) {
                $letter = (string) $this->getRandomNumber();
            }
        }

        $userName = implode('', $userName);

        if (
            !\in_array($userName, $this->generatedUsernames)
            && !$this->userRepository->findBy(['username' => $userName])
        ) {
            $this->generatedUsernames[] = $userName;

            return $userName;
        }

        if ($maxRetries > 0) {
            return $this->generateUniqueUsername($maxRetries--);
        }

        throw new \Exception('Could not generate a unique username');
    }

    /**
     * Generates a random letter between A and Z.
     */
    private function getRandomLetter(): string
    {
        return \chr(rand(65, 90));
    }

    private function getRandomNumber(): int
    {
        return rand(0, 9);
    }

    private function createNewMagicLinks(): array
    {
        $this->style->section('Creating new magic links');
        $this->style->progressStart($this->newMagicLinksCount);

        $homePageRedirect = $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);

        $privateKey = $this->filesystem->get('jwt/private.pem')->getContent();

        $count = 0;
        $newData = array_map(function ($user) {
            return [
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
                'magic_link' => '',
                'magic_link_creation' => (new \DateTime())->format('Y-m-d'),
            ];
        }, $this->users);

        foreach ($newData as $key => $user) {
            try {
                $payload = (new MagicLinkPayload($user['email'], $user['username'], $homePageRedirect))->toArray();
                $token = JWT::encode($payload, $privateKey, MagicLinkAuthenticator::JWT_ENCRYPTION_ALGORITHM);
                $user['magic_link'] = $this->router
                    ->generate('capco_magic_link', ['token' => $token], UrlGeneratorInterface::ABSOLUTE_URL)
                ;
                $newData[$user['email']] = $user;
                ++$count;
            } catch (\Throwable $th) {
                $this->unHandledUsers[] = $user;
            }
            unset($newData[$key]);
            $this->style->progressAdvance();
        }

        $this->style->progressFinish();
        $this->style->success($count . ' magic links generated !');

        return $newData;
    }

    private function insertDataIntoFile(string $filePath, array $newData): void
    {
        $this->style->section('Inserting data into file');
        $this->style->progressStart(\count($newData));

        $count = 0;
        $input = fopen($this->absoluteFilePath, 'r+');
        $output = fopen($this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '.tmp', 'w+');
        $errorLogs = fopen($this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_errors.txt', 'w+');

        $headers = false;
        while (false !== ($row = fgetcsv($input))) {
            try {
                if (false === $headers) {
                    $headers = true;
                    fputcsv($output, $row);
                    fputcsv($errorLogs, $row);

                    continue;
                }

                $email = $row[0];
                if (\array_key_exists($email, $newData)) {
                    fputcsv($output, [
                        $newData[$email]['email'],
                        $newData[$email]['username'],
                        $newData[$email]['magic_link_creation'],
                        $newData[$email]['magic_link'],
                    ]);
                    ++$count;
                    $this->style->progressAdvance();
                    unset($newData[$email]);
                } else {
                    $this->unHandledUsers[] = $row;
                }
            } catch (\Throwable $th) {
                $this->unHandledUsers[] = $row;
            }
        }

        foreach ($this->unHandledUsers as $user) {
            fputcsv($errorLogs, $user);
        }

        foreach ($newData as $user) {
            fputcsv($output, [
                $user['email'],
                $user['username'],
                $user['magic_link_creation'],
                $user['magic_link'],
            ]);
            ++$count;
            $this->style->progressAdvance();
        }

        fclose($input);
        fclose($output);

        if (1 === \count(file($this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_errors.txt'))) {
            unlink($this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_errors.txt');
        }

        rename(
            $this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '.tmp',
            $this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_complete.csv'
        );

        $this->style->progressFinish();
        $unHandledUsersCount = \count($this->unHandledUsers);
        if (0 < $unHandledUsersCount) {
            $this->style->warning($unHandledUsersCount . ' users could not be handled. See ' .
            $this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_errors.txt for more details.');
        }
        $this->style->success('New completed file available at : ' . $this->kernel->getProjectDir() . self::FILE_FOLDER . $filePath . '_complete.csv');
        $durationInDays = $this->kernel->getContainer()->getParameter('magiclinks_duration_in_days');
        $this->style->note([
            'You can now send the file to the client after checking it.',
            'The links will be valid for ' . $durationInDays . ' days. (Determined by env var SYMFONY_MAGICLINKS_DURATION_IN_DAYS during generation)',
            'The links will redirect to ' . $this->kernel->getContainer()->get('router')->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL),
        ]);
    }
}
