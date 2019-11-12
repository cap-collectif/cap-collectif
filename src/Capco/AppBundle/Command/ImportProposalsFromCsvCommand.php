<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ImportProposalsFromCsvCommand extends ContainerAwareCommand
{
    private const HEADERS = [
        'name',
        'author',
        'district_name',
        'address',
        'collect_status',
        'estimation',
        'category',
        'summary',
        'body',
        'proposal_illustration'
    ];

    protected static $defaultName = 'capco:import:proposals-from-csv';

    private $filePath;
    private $delimiter;
    private $proposalForm;
    private $questionsMap;
    private $newUsersMap;
    private $questionsHeader = [];

    private $om;
    private $mediaManager;
    private $districtRepository;
    private $proposalCategoryRepository;
    private $proposalFormRepository;
    private $statusRepository;
    private $userRepository;
    private $fosUserManager;
    private $map;

    public function __construct(
        MediaManager $mediaManager,
        ProposalDistrictRepository $districtRepository,
        ProposalCategoryRepository $proposalCategoryRepository,
        ProposalFormRepository $proposalFormRepository,
        StatusRepository $statusRepository,
        UserRepository $userRepository,
        UserManagerInterface $fosUserManager,
        Map $map,
        EntityManagerInterface $om,
        ?string $name = null
    ) {
        parent::__construct($name);
        $this->mediaManager = $mediaManager;
        $this->districtRepository = $districtRepository;
        $this->proposalCategoryRepository = $proposalCategoryRepository;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->statusRepository = $statusRepository;
        $this->userRepository = $userRepository;
        $this->fosUserManager = $fosUserManager;
        $this->map = $map;
        $this->om = $om;
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
                'i',
                InputOption::VALUE_NONE,
                'Does the csv has illustrations path ?'
            )
            ->addArgument('delimiter', InputArgument::OPTIONAL, ', or ;', ';');
    }

    protected function execute(InputInterface $input, OutputInterface $output): ?int
    {
        return $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getArgument('delimiter');
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
        foreach ($rows as $row) {
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
                $proposal->setTitle(Text::escapeHtml($row['name']));

                /** @var User $author */
                $author = $this->userRepository->findOneBy([
                    'email' => $row['author']
                ]);

                if (!$author) {
                    if (filter_var($row['author'], FILTER_VALIDATE_EMAIL)) {
                        $output->writeln(
                            '<error>Could not find user for "' . $row['author'] . '"</error>'
                        );

                        return 1;
                    }
                    if (!isset($this->newUsersMap[trim($row['author'])])) {
                        $output->writeln(
                            '<info>Creating a new user with a fake email and username: ' .
                                $row['author'] .
                                '</info>'
                        );
                        $this->newUsersMap[trim($row['author'])] = $this->createUserFromUsername(
                            trim($row['author'])
                        );
                    }
                    $author = $this->newUsersMap[trim($row['author'])];
                }

                $district = $this->districtRepository->findOneBy([
                    'name' => trim($row['district_name']),
                    'form' => $this->proposalForm
                ]);

                $status = $this->statusRepository->findOneBy([
                    'name' => trim($row['collect_status']),
                    'step' => $this->proposalForm->getStep()
                ]);

                if (null === $author) {
                    return $this->generateContentException($output);
                }

                $proposal->setAuthor($author);
                $proposal->setProposalForm($this->proposalForm);
                $proposal->setDistrict($district);
                $proposal->setStatus($status);
                if ('' !== $row['address']) {
                    $proposal->setAddress($this->map->getFormattedAddress($row['address']));
                }

                if ('' !== $row['estimation']) {
                    $proposal->setEstimation((float) $row['estimation']);
                }

                if ('' !== $row['category']) {
                    $proposalCategory = $this->proposalCategoryRepository->findOneBy([
                        'name' => trim($row['category']),
                        'form' => $this->proposalForm
                    ]);
                    $proposal->setCategory($proposalCategory);
                }

                if ('' !== $row['summary']) {
                    $proposal->setSummary(Text::escapeHtml($row['summary']));
                }

                $proposal->setBody(Text::escapeHtml($row['body']));

                if ($input->hasOption('illustrations')) {
                    try {
                        $filePath =
                            $input->getArgument('illustrations-path') .
                            \DIRECTORY_SEPARATOR .
                            $row['proposal_illustration'];
                        $info = pathinfo($filePath);
                        if (!isset($info['extension'])) {
                            $filePath .= '.jpg';
                        }
                        if ('' !== $row['proposal_illustration'] && file_exists($filePath)) {
                            $thumbnail = $this->mediaManager->createImageFromPath($filePath);
                            $proposal->setMedia($thumbnail);
                        }
                    } catch (\Exception $exception) {
                        $output->writeln('<info>' . $filePath . '</info> not found.');
                    }
                }

                if (\count($this->questionsHeader) > 0) {
                    foreach ($this->questionsHeader as $questionTitle) {
                        $reponse = (new ValueResponse())
                            ->setQuestion($this->questionsMap[$questionTitle])
                            ->setValue($row[$questionTitle]);
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
            filter_var($username . '@fake-email-cap-collectif.com', FILTER_SANITIZE_EMAIL)
        );
        $user->setPlainPassword('ykWc+ud(4vza2|');
        $user->setEnabled(true);
        $this->om->persist($user);

        return $user;
    }

    protected function isValidRow(array $row, OutputInterface $output): bool
    {
        $hasError = false;
        if (
            \count(array_values($row)) < \count(array_merge(self::HEADERS, $this->questionsHeader))
        ) {
            $hasError = true;
        }

        // name, author are mandatory
        if ('' === $row['name'] || '' === $row['author']) {
            $hasError = true;
        }

        if ($hasError) {
            return (bool) $this->generateContentException($output);
        }

        return true;
    }

    protected function isValidHeaders(OutputInterface $output): bool
    {
        if (\count($this->questionsHeader) > 0) {
            $found = false;
            foreach ($this->proposalForm->getRealQuestions() as $question) {
                if (\in_array($question->getTitle(), $this->questionsHeader, true)) {
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

    protected function getRecords(): \Iterator
    {
        $fileHeaders = Reader::createFromPath($this->filePath)
            ->setDelimiter($this->delimiter ?? ';')
            ->fetchOne();
        $this->questionsHeader = array_values(array_diff($fileHeaders, self::HEADERS));
        $finalHeader = array_merge(self::HEADERS, $this->questionsHeader);

        return Reader::createFromPath($this->filePath)
            ->setDelimiter($this->delimiter ?? ';')
            ->fetchAssoc($finalHeader);
    }

    protected function generateContentException(OutputInterface $output): int
    {
        $output->writeln('<error>Content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No proposal was created.</error>');

        return 1;
    }
}
