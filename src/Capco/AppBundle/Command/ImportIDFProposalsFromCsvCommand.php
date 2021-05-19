<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Common\Exception\SpoutException;
use Box\Spout\Common\Type;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\CSV\Writer;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\Text;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Liip\ImagineBundle\Exception\Config\Filter\NotFoundException;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ImportIDFProposalsFromCsvCommand extends ImportProposalsFromCsvCommand
{
    protected static $defaultName = 'capco:import:idf-proposals-from-csv';
    private ThemeRepository $themeRepository;
    private Indexer $indexer;
    private string $env;

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
        ThemeRepository $themeRepository,
        Indexer $indexer,
        string $env,
        ?string $name = null
    ) {
        parent::__construct(
            $mediaManager,
            $districtRepository,
            $proposalCategoryRepository,
            $proposalFormRepository,
            $statusRepository,
            $userRepository,
            $fosUserManager,
            $map,
            $om,
            $name
        );
        $this->themeRepository = $themeRepository;
        $this->indexer = $indexer;
        $this->env = $env;
    }

    protected function configure(): void
    {
        $this->setDescription('Import idf proposals from CSV file with specified proposal form id')
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
            ->addOption(
                'output',
                'o',
                InputOption::VALUE_OPTIONAL,
                'Please provide the path of failed imports.'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            );
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
        $outputFilePath = $input->getOption('output');

        // @var ProposalForm $proposalForm
        $this->proposalForm = $this->proposalFormRepository->find($proposalFormId);
        if (!$this->proposalForm) {
            throw new NotFoundException('The proposal form doesnt exist', 404);
        }
        $this->questionsMap = [];
        $this->newUsersMap = [];

        $this->isProposalFormExist($output, $proposalFormId);
        $this->customFields = $this->proposalForm->getCustomFields();
        $this->headers = array_flip(
            array_merge(
                $this->proposalForm->getFieldsUsed(),
                $this->proposalForm->getCustomFields()
            )
        );
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
        $proposals = [];
        $proposalsFail = [];

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

                try {
                    $district = null;
                    if (
                        $this->proposalForm->isUsingDistrict() &&
                        !empty($row[$this->headers['district']])
                    ) {
                        $district = $this->districtRepository->findDistrictByName(
                            trim($row[$this->headers['district']])
                        );
                    }
                    $status = $this->proposalForm->getStep()->getDefaultStatus();
                    if (isset($this->headers['status']) && !empty($row[$this->headers['status']])) {
                        $status = $this->statusRepository->findOneBy([
                            'name' => trim($row[$this->headers['status']]),
                            'step' => $this->proposalForm->getStep(),
                        ]);
                    }
                    $theme = null;
                    if (
                        $this->proposalForm->isUsingThemes() &&
                        !empty($row[$this->headers['theme']])
                    ) {
                        $theme = $this->themeRepository->findOneWithTitle(
                            trim($row[$this->headers['theme']])
                        );
                    }
                    $author = $this->userRepository->findOneByEmail($row[$this->headers['author']]);
                    $media = null;
                    if (
                        $this->proposalForm->isUsingIllustration() &&
                        !empty($row[$this->headers['media_url']])
                    ) {
                        $media = $this->getMedia($row[$this->headers['media_url']]);
                    }
                } catch (\Exception $exception) {
                    $proposalsFail[] = $row;

                    continue;
                }

                if (null === $author) {
                    $proposalsFail[] = $row;

                    continue;
                }
                $proposals[] = $this->createProposal(
                    $row,
                    $author,
                    $district,
                    $status,
                    $theme,
                    $media
                );
            }

            ++$loop;
        }

        try {
            $this->om->flush();
            foreach ($proposals as $proposal) {
                $this->indexer->index(Proposal::class, $proposal->getId());
            }
            $this->indexer->finishBulk();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>Error when flushing proposals : ' . $e->getMessage() . '</error>'
            );

            return 1;
        }

        $progress->finish();

        $output->writeln('<info>' . \count($proposals) . ' proposals successfully created.</info>');
        $this->catchFailingImport($proposalsFail, $outputFilePath, $output);

        return 0;
    }

    protected function isValidRow(array $row, OutputInterface $output): bool
    {
        $hasError = false;
        if (\count(array_values($row)) < \count($this->headers)) {
            $hasError = true;
        }

        // name, author are mandatory
        if ('' === $row[$this->headers['title']] || '' === $row[$this->headers['author']]) {
            $hasError = true;
        }

        if ($hasError) {
            return (bool) $this->generateContentException($output);
        }

        return true;
    }

    protected function getRecords(): \Iterator
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->filePath);

        return $reader
            ->getSheetIterator()
            ->current()
            ->getRowIterator();
    }

    private function catchFailingImport(
        array $proposalsFail,
        ?string $outputFilePath,
        OutputInterface $output
    ) {
        if (\count($proposalsFail) > 0 && 'test' !== $this->env && $outputFilePath) {
            $header = array_merge($this->headers, $this->customFields);

            try {
                /** @var Writer $writer */
                $writer = WriterFactory::create(Type::CSV, $this->delimiter);
                $writer->setShouldAddBOM(false);
                $writer->openToFile($outputFilePath);
                $writer->addRow(WriterEntityFactory::createRowFromArray($header));
            } catch (SpoutException $spoutException) {
                throw new \RuntimeException(__METHOD__ . $spoutException->getMessage());
            }
            foreach ($proposalsFail as $failed) {
                $writer->addRow(WriterEntityFactory::createRowFromArray($failed));
            }
            $writer->close();
            $output->writeln('<error>And ' . \count($proposalsFail) . ' proposals failed.</error>');
        }
    }

    private function getMedia($url): ?Media
    {
        if ($url && filter_var($url, \FILTER_VALIDATE_URL)) {
            $mediaBinaryFile = file_get_contents($url);
            $array = explode('/', $url);
            $mediaName = end($array);
            file_put_contents('/tmp/' . $mediaName, $mediaBinaryFile);

            return $this->mediaManager->createImageFromPath('/tmp/' . $mediaName, $mediaName);
        }

        return null;
    }

    private function isProposalFormExist($output, $proposalFormId)
    {
        if (null === $this->proposalForm) {
            $output->writeln(
                '<error>Proposal Form with id ' .
                    $proposalFormId .
                    ' was not found in your database. Please create it or change the id.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        return 0;
    }

    private function createProposal(
        array $row,
        User $author,
        ?ProposalDistrict $district,
        ?Status $status,
        ?Theme $theme,
        ?Media $media
    ): Proposal {
        $proposal = new Proposal();
        $proposal->setTitle(Text::escapeHtml($row[$this->headers['title']]));
        $proposal->setAuthor($author);
        $proposal->setProposalForm($this->proposalForm);
        $proposal->setDistrict($district);
        $proposal->setStatus($status);
        $proposal->setTheme($theme);
        $proposal->setMedia($media);
        $proposal->setPublishedAt(new \DateTime());
        if ($this->proposalForm->getUsingAddress() && !empty($row[$this->headers['address']])) {
            if (Text::isJSON($row[$this->headers['address']])) {
                $proposal->setAddress($row[$this->headers['address']]);
            } else {
                $proposal->setAddress(
                    $this->map->getFormattedAddress($row[$this->headers['address']])
                );
            }
        }
        if ($this->proposalForm->isUsingTipsmeee()) {
            $proposal->setTipsmeeeId($row[$this->headers['tipsmeeee']]);
        }
        if (
            $this->proposalForm->isUsingEstimation() &&
            !empty($row[$this->headers['estimation']])
        ) {
            $proposal->setEstimation((float) $row[$this->headers['estimation']]);
        }

        if ($this->proposalForm->isUsingCategories() && !empty($row[$this->headers['category']])) {
            $proposalCategory = $this->proposalCategoryRepository->findOneBy([
                'name' => trim($row[$this->headers['category']]),
                'form' => $this->proposalForm,
            ]);
            $proposal->setCategory($proposalCategory);
        }

        if ($this->proposalForm->getUsingSummary() && !empty($row[$this->headers['summary']])) {
            $proposal->setSummary(Text::escapeHtml($row[$this->headers['summary']]));
        }
        if ($this->proposalForm->getUsingDescription() && !empty($row[$this->headers['body']])) {
            $proposal->setBody($row[$this->headers['body']]);
        }
        if (\count($this->proposalForm->getCustomFields()) > 0) {
            foreach ($this->customFields as $questionTitle) {
                $response = (new ValueResponse())
                    ->setQuestion($this->questionsMap[$questionTitle])
                    ->setValue($row[$this->headers[$questionTitle]] ?? '');
                $proposal->addResponse($response);
            }
        }

        $this->om->persist($proposal);

        return $proposal;
    }
}
