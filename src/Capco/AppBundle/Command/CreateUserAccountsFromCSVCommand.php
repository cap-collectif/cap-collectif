<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Common\Exception\SpoutException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
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

    public function __construct(
        protected UserManagerInterface $userManager,
        protected TokenGeneratorInterface $tokenGenerator,
        protected UserRepository $userRepository,
        protected RouterInterface $router,
        protected ConvertCsvToArray $csvReader,
        protected RegistrationFormRepository $registrationFormRepository,
        protected UserNotifier $userNotifier
    ) {
        parent::__construct();
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
                'force-enabled',
                false,
                InputOption::VALUE_NONE,
                'set this option to force enable imported users.'
            )
            ->addOption(
                'force-confirmed-email',
                false,
                InputOption::VALUE_NONE,
                'set this option to consider confirmed email for imported users.'
            )
            ->addOption(
                'generate-email',
                false,
                InputOption::VALUE_OPTIONAL,
                'set this option to generate email for imported users.'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            )
            ->addUsage('--with-password --delimiter="," --force-enabled --force-confirmed-email /path/to/accounts-to-create.csv /path/to/created-accounts.csv')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $sendEmail = false; // Not used for now
        $inputFilePath = $input->getArgument('input');
        $outputFilePath = $input->getArgument('output');
        $delimiter = $input->getOption('delimiter');
        $withPassword = $input->getOption('with-password');
        $forceEnabled = $input->getOption('force-enabled');
        $forceConfirmedEmail = $input->getOption('force-confirmed-email');
        $withQuestions = $input->getOption('with-custom-fields');
        $generateEmail = $input->getOption('generate-email');

        if (!is_file($inputFilePath)) {
            $io->error('File "' . $inputFilePath . '" does not exist.');

            return Command::FAILURE;
        }
        if (!str_ends_with((string) $inputFilePath, '.csv')) {
            $io->error('Only csv files are allowed');

            return Command::FAILURE;
        }

        $rows = $this->csvReader->convert($inputFilePath, $delimiter);

        // We ask for a domain when this option is passed without a value.
        if (true === $generateEmail) {
            $emailDomain = $io->ask(
                'What is the email\'s domain do you want to use? (e.g: cap-collectif.com)'
            );
        } else {
            $emailDomain = $generateEmail;
        }

        $createdCount = 0;
        $outputHeadersRow = $withPassword
            ? self::HEADERS_WITH_PASSWORD
            : self::HEADERS_WITH_FORGOT_PASSWORD_LINK;

        try {
            /** @var Writer $writer */
            $writer = WriterFactory::create(Type::CSV, $delimiter);
            $writer->setShouldAddBOM(false);
            $writer->openToFile($outputFilePath);
            $writer->addRow(WriterEntityFactory::createRowFromArray($outputHeadersRow));
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
                \FILTER_SANITIZE_EMAIL
            );

            try {
                $previousUser = $this->userRepository->findOneByEmail($email);
                if ($previousUser) {
                    $io->warning('Skipping existing user: ' . $email);

                    continue;
                }

                /** @var User $user */
                $user = $this->userManager->createUser();
                $user->setEmail($email);

                $generatedPassword = $row['password'] ?? bin2hex(random_bytes(4));

                if (!$generateEmail && !$forceConfirmedEmail) {
                    $user->setUsername($row['username']);
                    $user->setConfirmationToken($this->tokenGenerator->generateToken());
                    $user->setResetPasswordToken($this->tokenGenerator->generateToken());
                } else {
                    $user->setUsername($row['first_name'] . ' ' . $row['last_name']);
                    $user->setFirstname($row['first_name']);
                    $user->setLastname($row['last_name']);
                    $user->setPlainPassword($generatedPassword);
                }

                $user->setEnabled($generateEmail || $forceEnabled);

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

                if (!$generateEmail && !$forceConfirmedEmail) {
                    $confirmationUrl = $this->router->generate(
                        'account_confirm_email',
                        [
                            'token' => $user->getConfirmationToken(),
                        ],
                        true
                    );
                    if ($sendEmail) {
                        $this->userNotifier->emailConfirmation($user);
                    }
                    $writer->addRow(
                        WriterEntityFactory::createRowFromArray([
                            $user->getEmail(),
                            $confirmationUrl,
                        ])
                    );
                } else {
                    $writer->addRow(
                        WriterEntityFactory::createRowFromArray([
                            $user->getFirstname(),
                            $user->getLastname(),
                            $user->getEmail(),
                            $generatedPassword,
                        ])
                    );
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

        return Command::SUCCESS;
    }

    private function deduplicateEmail(array $rows, SymfonyStyle $output): array
    {
        $deduplicatedRows = [];

        foreach ($rows as $row) {
            if ($row instanceof Row) {
                $row = $row->toArray();
            }
            $niddle = $row['email'];
            if (isset($deduplicatedRows[$niddle])) {
                continue;
            }
            $deduplicatedRows[$niddle] = $row;
        }
        if (\count($rows) > \count($deduplicatedRows)) {
            $output->warning(
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
