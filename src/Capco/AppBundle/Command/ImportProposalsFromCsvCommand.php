<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Box\Spout\Reader\CSV\RowIterator;
use Box\Spout\Reader\CSV\Sheet;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ImportProposalsFromCsvCommand extends Command
{
    protected const HEADERS = [
        'name',
        'author',
        'district_name',
        'address',
        'collect_status',
        'estimation',
        'category',
        'summary',
        'body',
        'proposal_illustration',
    ];

    protected static $defaultName = 'capco:import:proposals-from-csv';

    protected ?string $filePath;
    protected ?string $delimiter;
    protected ?ProposalForm $proposalForm;
    protected ?array $questionsMap;
    protected array $newUsersMap;
    protected array $customFields = [];
    protected array $headers;

    public function __construct(
        protected MediaManager $mediaManager,
        protected ProposalDistrictRepository $districtRepository,
        protected ProposalCategoryRepository $proposalCategoryRepository,
        protected ProposalFormRepository $proposalFormRepository,
        protected StatusRepository $statusRepository,
        protected UserRepository $userRepository,
        protected UserManagerInterface $fosUserManager,
        protected Map $map,
        protected EntityManagerInterface $om,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this->setDescription('Import proposals from CSV file with specified proposal form id')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'proposal-form',
                InputArgument::REQUIRED,
                'Please provide the proposal form id where you want to import proposals.'
            )
            ->addArgument(
                'illustrations-path',
                InputArgument::OPTIONAL,
                'Please provide the path where are located illustrations (if any)'
            )
            ->addOption(
                'illustrations',
                'il',
                InputOption::VALUE_NONE,
                'Does the csv has illustrations path ?'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): ?int
    {
        return $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getOption('delimiter');
        $proposalFormId = $input->getArgument('proposal-form');

        // @var ProposalForm $proposalForm
        $this->proposalForm = $this->proposalFormRepository->find($proposalFormId);
        $this->questionsMap = [];
        $this->newUsersMap = [];

        if (null === $this->proposalForm) {
            $output->writeln(
                '<error>Proposal Form with id ' .
                    $proposalFormId .
                    ' was not found in your database. Please create it or change the id.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        $rows = $this->getRecords();
        $count = \count(iterator_to_array($rows));

        if (0 === $count) {
            $output->writeln(
                '<error>Your file with path ' .
                    $this->filePath .
                    ' was not found or no proposal was found in your file. Please verify your path and file\'s content.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        $progress = new ProgressBar($output, $count - 1);
        $progress->start();

        $loop = 1;
        /** @var Row $row */
        foreach ($rows as $row) {
            $row = $row->toArray();
            // if first line : check if headers are valid
            if (1 === $loop) {
                if (!$this->isValidHeaders($output)) {
                    return $this->generateContentException($output);
                }
            } else {
                if (!$this->isValidRow($row, $output)) {
                    return $this->generateContentException($output);
                }

                $proposal = new Proposal();

                $proposal->setTitle(Text::escapeHtml($row[$this->headers['name']]));

                /** @var User $author */
                $author = $this->userRepository->findOneBy([
                    'email' => $row[$this->headers['author']],
                ]);

                if (!$author) {
                    if (filter_var($row[$this->headers['author']], \FILTER_VALIDATE_EMAIL)) {
                        $output->writeln(
                            '<error>Could not find user for "' .
                                $row[$this->headers['author']] .
                                '"</error>'
                        );

                        return 1;
                    }
                    if (!isset($this->newUsersMap[trim((string) $row[$this->headers['author']])])) {
                        $output->writeln(
                            '<info>Creating a new user with a fake email and username: ' .
                                $row[$this->headers['author']] .
                                '</info>'
                        );
                        $this->newUsersMap[
                            trim((string) $row[$this->headers['author']])
                        ] = $this->createUserFromUsername(trim((string) $row[$this->headers['author']]));
                    }
                    $author = $this->newUsersMap[trim((string) $row[$this->headers['author']])];
                }

                $district = $this->districtRepository->findDistrictByName(
                    trim((string) $row[$this->headers['district_name']]),
                    $this->proposalForm
                );

                $status = $this->statusRepository->findOneBy([
                    'name' => trim((string) $row[$this->headers['collect_status']]),
                    'step' => $this->proposalForm->getStep(),
                ]);

                if (null === $author) {
                    return $this->generateContentException($output);
                }

                $proposal->setAuthor($author);
                $proposal->setProposalForm($this->proposalForm);
                $proposal->setDistrict($district);
                $proposal->setStatus($status);
                if ('' !== $row[$this->headers['address']]) {
                    $proposal->setAddress(
                        $this->map->getFormattedAddress($row[$this->headers['address']])
                    );
                }

                if ('' !== $row[$this->headers['estimation']]) {
                    $proposal->setEstimation((float) $row[$this->headers['estimation']]);
                }

                if ('' !== $row[$this->headers['category']]) {
                    $proposalCategory = $this->proposalCategoryRepository->findOneBy([
                        'name' => trim((string) $row[$this->headers['category']]),
                        'form' => $this->proposalForm,
                    ]);
                    $proposal->setCategory($proposalCategory);
                }

                if ('' !== $row[$this->headers['summary']]) {
                    $proposal->setSummary(Text::escapeHtml($row[$this->headers['summary']]));
                }

                $proposal->setBody(nl2br((string) $row[$this->headers['body']]));

                if ($input->hasOption('illustrations')) {
                    try {
                        $filePath =
                            $input->getArgument('illustrations-path') .
                            \DIRECTORY_SEPARATOR .
                            $row[$this->headers['proposal_illustration']];
                        $info = pathinfo($filePath);
                        if (!isset($info['extension'])) {
                            $filePath .= '.jpg';
                        }
                        if (
                            '' !== $row[$this->headers['proposal_illustration']]
                            && file_exists($filePath)
                        ) {
                            $thumbnail = $this->mediaManager->createImageFromPath($filePath);
                            $proposal->setMedia($thumbnail);
                        }
                    } catch (\Exception) {
                        $output->writeln('<info>' . $this->filePath . '</info> not found.');
                    }
                }

                if (\count($this->customFields) > 0) {
                    foreach ($this->customFields as $questionTitle) {
                        $reponse = (new ValueResponse())
                            ->setQuestion($this->questionsMap[$questionTitle])
                            ->setValue($row[$this->headers[$questionTitle]] ?? '')
                        ;
                        $proposal->addResponse($reponse);
                    }
                }

                $this->om->persist($proposal);
            }

            ++$loop;
        }

        try {
            $this->om->flush();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>Error when flushing proposals : ' . $e->getMessage() . '</error>'
            );

            return 1;
        }

        $progress->finish();

        $output->writeln(
            '<info>' .
                (\count(iterator_to_array($rows)) - 1) .
                ' proposals successfully created.</info>'
        );

        return 0;
    }

    protected function createUserFromUsername(string $username): UserInterface
    {
        $user = $this->fosUserManager->createUser();
        $user->setUsername($username);
        $user->setEmail(
            filter_var($username . '@fake-email-cap-collectif.com', \FILTER_SANITIZE_EMAIL)
        );
        $user->setPlainPassword('ykWc+ud(4vza2|');
        $user->setEnabled(true);
        $this->om->persist($user);

        return $user;
    }

    protected function isValidRow(array $row, OutputInterface $output): bool
    {
        $hasError = false;
        if (\count(array_values($row)) < \count(array_merge(self::HEADERS, $this->customFields))) {
            $hasError = true;
        }

        // name, author are mandatory
        if ('' === $row[$this->headers['name']] || '' === $row[$this->headers['author']]) {
            $hasError = true;
        }

        if ($hasError) {
            return (bool) $this->generateContentException($output);
        }

        return true;
    }

    protected function isValidHeaders(OutputInterface $output): bool
    {
        if (\count($this->customFields) > 0) {
            $found = false;
            foreach ($this->proposalForm->getRealQuestions() as $question) {
                if (\in_array($question->getTitle(), $this->customFields, true)) {
                    $found = true;
                    $this->questionsMap[$question->getTitle()] = $question;
                }
            }
            if (!$found) {
                $output->writeln('<error>Error could not find all questions</error>');

                return false;
            }
        }

        return true;
    }

    /**
     * @throws \Box\Spout\Common\Exception\UnsupportedTypeException
     * @throws \Box\Spout\Reader\Exception\ReaderNotOpenedException
     * @throws \Box\Spout\Common\Exception\IOException
     */
    protected function getRecords(): \Iterator
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');

        $reader->open($this->filePath);
        /** @var Sheet $sheet */
        foreach ($reader->getSheetIterator() as $sheet) {
            /** @var RowIterator $rows */
            $rows = $sheet->getRowIterator();
            /** @var Row $row */
            foreach ($rows as $row) {
                $a = $row->toArray();
                $this->customFields = array_values(array_diff($a, $this::HEADERS));

                break;
            }
            $this->headers = array_flip(array_merge($this::HEADERS, $this->customFields));

            return $sheet->getRowIterator();
        }

        return new \ArrayIterator([]);
    }

    protected function generateContentException(OutputInterface $output): int
    {
        $output->writeln('<error>Content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No proposal was created.</error>');

        return 1;
    }
}
