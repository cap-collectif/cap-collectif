<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Exception\SpoutException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\CSV\Writer;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Cocur\Slugify\Slugify;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class CreateUserAccountsFromCSVCommand extends Command
{
    protected const HEADERS_WITH_FORGOT_PASSWORD_LINK = ['email', 'confirmation_link'];
    protected const HEADERS_WITH_PASSWORD = ['first_name', 'last_name', 'email', 'password'];

    protected $userManager;
    protected $tokenGenerator;
    protected $userRepository;
    protected $router;
    protected $csvReader;
    protected $registrationFormRepository;
    protected $userNotifier;

    public function __construct(
        UserManagerInterface $userManager,
        TokenGeneratorInterface $tokenGenerator,
        UserRepository $userRepository,
        RouterInterface $router,
        ConvertCsvToArray $csvReader,
        RegistrationFormRepository $registrationFormRepository,
        UserNotifier $userNotifier
    ) {
        parent::__construct();
        $this->userManager = $userManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->userRepository = $userRepository;
        $this->router = $router;
        $this->csvReader = $csvReader;
        $this->registrationFormRepository = $registrationFormRepository;
        $this->userNotifier = $userNotifier;
    }

    protected function configure()
    {
        $this->setName('capco:create-users-account-from-csv')
            ->addArgument(
                'input',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'output',
                InputArgument::REQUIRED,
                'Please provide the path of the export.'
            )
            ->addOption(
                'with-custom-fields',
                false,
                InputOption::VALUE_NONE,
                'set this option to import custom fields for an user.'
            )
            ->addOption(
                'with-password',
                false,
                InputOption::VALUE_NONE,
                'set this option to generate a CSV with users password.'
            )
            ->addOption(
                'generate-email',
                false,
                InputOption::VALUE_OPTIONAL,
                'set this option to generate email for imported users.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $sendEmail = false; // Not used for now
        $inputFilePath = $input->getArgument('input');
        $outputFilePath = $input->getArgument('output');
        $rows = $this->csvReader->convert($inputFilePath);
        $withPassword = $input->getOption('with-password');
        $withQuestions = $input->getOption('with-custom-fields');
        $generateEmail = $input->getOption('generate-email');
        $isTest = $input->getParameterOption(array('--env', '-e'), 'dev') === 'test';


        // We ask for a domain when this option is passed without a value.
        if (true === $generateEmail) {
            $emailDomain = $io->ask(
                'What is the email\'s domain do you want to use? (e.g: cap-collectif.com)'
            );
        } else {
            $emailDomain = $generateEmail;
        }

        $createdCount = 0;
        $headersRow = $withPassword
            ? self::HEADERS_WITH_PASSWORD
            : self::HEADERS_WITH_FORGOT_PASSWORD_LINK;

        try {
            /** @var Writer $writer */
            $writer = WriterFactory::create(Type::CSV, $isTest ? ',' : ';');
            $writer->setShouldAddBOM(false);
            $writer->openToFile($outputFilePath);
            $writer->addRow($headersRow);
        } catch (SpoutException $spoutException) {
            throw new \RuntimeException(__METHOD__ . $spoutException->getMessage());
        }

        // We deduplicate rows by email
        $deduplicatedRows = !$generateEmail ? $this->deduplicateEmail($rows, $io) : $rows;

        $progressBar = new ProgressBar($output, \count($deduplicatedRows));
        $progressBar->start();
        foreach ($deduplicatedRows as $row) {
            $progressBar->advance();
            $email = filter_var(
                !$generateEmail ? $row['email'] : $this->generateEmail($row, $emailDomain),
                FILTER_SANITIZE_EMAIL
            );

            try {
                $previousUser = $this->userRepository->findOneByEmail($email);
                if ($previousUser) {
                    $io->caution('Skipping existing user: ' . $email);

                    continue;
                }

                /** @var User $user */
                $user = $this->userManager->createUser();
                $user->setEmail($email);

                $generatedPassword = bin2hex(random_bytes(4));

                if (!$generateEmail) {
                    $user->setUsername($row['username']);
                    $user->setConfirmationToken($this->tokenGenerator->generateToken());
                    $user->setResetPasswordToken($this->tokenGenerator->generateToken());
                } else {
                    $user->setUsername($row['first_name'] . ' ' . $row['last_name']);
                    $user->setFirstname($row['first_name']);
                    $user->setLastname($row['last_name']);
                    $user->setPlainPassword($generatedPassword);
                }

                $user->setEnabled($generateEmail ? true : false);

                // Handle custom questions
                if ($withQuestions) {
                    $registrationForm = $this->registrationFormRepository->findCurrent();
                    $questions = $registrationForm->getRealQuestions();

                    if ($questions->count() > 0) {
                        foreach ($questions as $question) {
                            if (isset($row[$question->getTitle()])) {
                                $value = $row[$question->getTitle()];
                                $response = new ValueResponse();
                                $response->setValue($value);
                                $response->setQuestion($question);
                                $user->addResponse($response);
                            }
                        }
                    }
                }

                $this->userManager->updateUser($user);

                if (!$generateEmail) {
                    $confirmationUrl = $this->router->generate(
                        'account_confirm_email',
                        [
                            'token' => $user->getConfirmationToken()
                        ],
                        true
                    );
                    if ($sendEmail) {
                        $this->userNotifier->emailConfirmation($user);
                    }
                    $writer->addRow([$user->getEmail(), $confirmationUrl]);
                } else {
                    $writer->addRow([
                        $user->getFirstname(),
                        $user->getLastname(),
                        $user->getEmail(),
                        $generatedPassword
                    ]);
                }
                ++$createdCount;
            } catch (\Exception $e) {
                $io->error($e->getMessage());
                $io->error('Failed to create user : ' . $email);
            }
        }
        if ($writer instanceof WriterInterface) {
            $writer->close();
        }
        $progressBar->finish();
        $io->success($createdCount . ' users created.');
    }

    private function deduplicateEmail(array $rows, SymfonyStyle $output): array
    {
        $deduplicatedRows = [];

        foreach ($rows as $row) {
            $niddle = $row['email'];
            if (isset($deduplicatedRows[$niddle])) {
                continue;
            }
            $deduplicatedRows[$niddle] = $row;
        }
        if (\count($rows) > \count($deduplicatedRows)) {
            $output->caution(
                'Skipping ' . (\count($rows) - \count($deduplicatedRows)) . ' duplicated email(s).'
            );
        }

        return $deduplicatedRows;
    }

    private function generateEmail(array $row, string $domain): string
    {
        return sprintf(
            '%s@%s',
            Slugify::create()->slugify($row['first_name'] . '-' . $row['last_name']),
            $domain
        );
    }
}
