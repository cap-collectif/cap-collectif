<?php

namespace Capco\AppBundle\Import;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\GraphQL\Mutation\AddProposalsFromCsvMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalMutation;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\SpoutHelper;
use Capco\AppBundle\Utils\Text;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;

class ImportProposalsFromCsv
{
    protected ?string $projectDir;
    protected ?string $filePath;
    protected ?string $delimiter;
    protected ?ProposalForm $proposalForm;
    protected ?array $questionsMap;
    protected array $customFields = [];
    protected EntityManagerInterface $om;
    protected MediaManager $mediaManager;
    protected ProposalDistrictRepository $districtRepository;
    protected ProposalCategoryRepository $proposalCategoryRepository;
    protected ProposalRepository $proposalRepository;
    protected StatusRepository $statusRepository;
    protected UserRepository $userRepository;
    protected UserManagerInterface $fosUserManager;
    protected Map $map;
    protected array $headers;
    protected LoggerInterface $logger;
    protected ThemeRepository $themeRepository;
    protected Indexer $indexer;
    protected Reader $reader;

    public function __construct(
        MediaManager $mediaManager,
        ProposalDistrictRepository $districtRepository,
        ProposalCategoryRepository $proposalCategoryRepository,
        ProposalRepository $proposalRepository,
        StatusRepository $statusRepository,
        UserRepository $userRepository,
        Map $map,
        EntityManagerInterface $om,
        ThemeRepository $themeRepository,
        Indexer $indexer,
        LoggerInterface $logger,
        string $projectDir
    ) {
        $this->mediaManager = $mediaManager;
        $this->districtRepository = $districtRepository;
        $this->proposalCategoryRepository = $proposalCategoryRepository;
        $this->proposalRepository = $proposalRepository;
        $this->statusRepository = $statusRepository;
        $this->userRepository = $userRepository;
        $this->map = $map;
        $this->om = $om;
        $this->themeRepository = $themeRepository;
        $this->indexer = $indexer;
        $this->logger = $logger;
        $this->projectDir = $projectDir;
    }

    public function setProposalForm(ProposalForm $proposalForm)
    {
        $this->proposalForm = $proposalForm;
    }

    public function setFilePath(string $filePath)
    {
        $this->filePath = $filePath;
    }

    public function setDelimiter(string $delimiter)
    {
        $this->delimiter = $delimiter;
    }

    public function import(CollectStep $step, $dryRun = true, ?OutputInterface $output = null)
    {
        $this->questionsMap = [];
        $this->customFields = $this->proposalForm->getCustomFields();
        $this->headers = array_flip(
            array_merge(
                $this->proposalForm->getFieldsUsed(),
                $this->proposalForm->getCustomFields()
            )
        );
        $reader = $this->getRecords();
        $rows = $reader
            ->getSheetIterator()
            ->current()
            ->getRowIterator();
        $rows->rewind();
        $count = \count(iterator_to_array($rows));

        if (0 === $count) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::EMPTY_FILE);
        }
        $rows->rewind();
        if (!$this->isValidHeaders($rows->current()->toArray())) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::BAD_DATA_MODEL);
        }

        $associativeRowsWithHeaderLine = $this->getAssociativeRowsColumns($reader);
        $duplicates = $this->getDuplicates($associativeRowsWithHeaderLine, $step);
        if (empty($step)) {
            throw new \RuntimeException('STEP_NOT_FOUND');
        }

        if ($output) {
            $progress = new ProgressBar($output, $count - 1);
            $progress->start();
        }
        $createdProposals = [];
        $proposalsFail = [];
        $mandatoryMissing = [];
        $importableProposals = 0;
        $this->loopRows(
            $associativeRowsWithHeaderLine,
            $createdProposals,
            $importableProposals,
            $proposalsFail,
            $mandatoryMissing,
            $duplicates,
            $dryRun
        );

        if ($output) {
            $progress->finish();
        }

        if (!$dryRun && !empty($createdProposals)) {
            try {
                foreach ($createdProposals as $proposal) {
                    $this->om->persist($proposal);
                }
                $this->om->flush();
                foreach ($createdProposals as $proposal) {
                    $this->indexer->index(Proposal::class, $proposal->getId());
                }
                $this->indexer->finishBulk();
            } catch (\Exception $e) {
                $this->logger->error('Error when flushing proposals : ' . $e->getMessage());
            }
        }

        return [
            'importedProposals' => !$dryRun && !empty($createdProposals) ? $createdProposals : [],
            'importableProposals' => $importableProposals,
            'badLines' => array_values($proposalsFail),
            'duplicates' => array_values($duplicates),
            'mandatoryMissing' => array_values($mandatoryMissing),
            'errorCode' => null,
        ];
    }

    protected function getRecords(): Reader
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->projectDir . $this->filePath);

        return $reader;
    }

    protected function getAssociativeRowsColumns(Reader $reader): array
    {
        $rowWithHeaderKeys = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            //Initialize SpoutHelper with the current Sheet and       the row number which contains the header
            $spoutHelper = new SpoutHelper($sheet, 1);

            foreach ($sheet->getRowIterator() as $key => $row) {
                //Get the indexed array with col name as key and col val as value`
                $rowWithHeaderKeys[] = $spoutHelper->rowWithFormattedHeaders($row->toArray());
            }
        }

        return $rowWithHeaderKeys;
    }

    protected function isValidRow(array $row): bool
    {
        $fields = $this->proposalForm->getMandatoryFieldsUsed();
        foreach ($fields as $field => $mandatory) {
            if ($mandatory && empty($row[$field])) {
                return false;
            }
        }

        return true;
    }

    protected function isValidHeaders(array $fileHeader): bool
    {
        if (array_flip($fileHeader) === $this->headers) {
            return true;
        }

        foreach ($fileHeader as $column) {
            if (!\in_array($column, $this->headers)) {
                return false;
            }
        }

        if (\count($fileHeader) > \count($this->headers)) {
            return false;
        }
        if (\count($fileHeader) < \count($this->headers)) {
            return false;
        }

        if (\count($this->customFields) > 0) {
            $found = false;
            foreach ($this->proposalForm->getRealQuestions() as $question) {
                if (\in_array($question->getTitle(), $this->customFields, true)) {
                    $found = true;
                    $this->questionsMap[$question->getTitle()] = $question;
                }
            }
            if (!$found) {
                return false;
            }
        }

        return true;
    }

    private function getDuplicates(array $rows, AbstractStep $step): array
    {
        $duplicates = [];
        $proposals = [];
        /** @var Row $row */
        foreach ($rows as $key => $row) {
            ++$key;
            if (1 === $key) {
                continue;
            }
            $current = [$row['title'], $row['author']];
            if (\in_array($current, $proposals)) {
                $duplicates[] = $key;
            } elseif (
                $this->proposalRepository->getProposalByEmailAndTitleOnStep(
                    $row['title'],
                    $row['author'],
                    $step,
                    $this->proposalForm
                ) > 0
            ) {
                $duplicates[] = $key;
            }
            $proposals[] = $current;
        }

        return $duplicates;
    }

    private function loopRows(
        array $rows,
        array &$proposals,
        int &$importableProposals,
        array &$proposalsFail,
        array &$mandatoryMissing,
        array $duplicates,
        bool $dryRun = true
    ) {
        foreach ($rows as $key => $row) {
            $isCurrentLineFail = false;
            // array start at 0, csv start at 1
            ++$key;
            // first line is the header, skipped it
            if (1 === $key) {
                continue;
            }
            if (\in_array($key, $duplicates)) {
                continue;
            }

            // if row is not valid
            if (!$this->isValidRow($row)) {
                $mandatoryMissing[] = $key;

                continue;
            }

            try {
                $status = $media = $theme = $author = $district = null;
                if ($this->proposalForm->isUsingDistrict() && !empty($row['district'])) {
                    if (
                        !($district = $this->districtRepository->findDistrictByName(
                            trim($row['district'])
                        ))
                    ) {
                        $isCurrentLineFail = true;
                        $proposalsFail[] = $key;
                    }
                }
                $status = $this->proposalForm->getStep()->getDefaultStatus();
                if (isset($row['status']) && !empty($row['status'])) {
                    if (
                        !($status = $this->statusRepository->findOneBy([
                            'name' => trim($row['status']),
                            'step' => $this->proposalForm->getStep(),
                        ]))
                    ) {
                        $isCurrentLineFail = true;
                        $proposalsFail[] = $key;
                    }
                }
                $theme = null;
                if ($this->proposalForm->isUsingThemes() && !empty($row['theme'])) {
                    if (!($theme = $this->themeRepository->findOneWithTitle(trim($row['theme'])))) {
                        $proposalsFail[] = $key;
                        $isCurrentLineFail = true;
                    }
                }
                if (!($author = $this->userRepository->findOneByEmail($row['author']))) {
                    $proposalsFail[] = $key;
                    $isCurrentLineFail = true;
                }
                $media = null;
                if ($this->proposalForm->isUsingIllustration() && !empty($row['media_url'])) {
                    if (!($media = $this->getMedia($row['media_url']))) {
                        $proposalsFail[] = $key;
                        $isCurrentLineFail = true;
                    }
                }
            } catch (\Exception $exception) {
                $this->logger->error($exception->getMessage());

                $proposalsFail[] = $key;
            }
            if (!$dryRun && !$isCurrentLineFail && $author) {
                $proposals[$key] = $this->createProposal(
                    $row,
                    $author,
                    $district,
                    $status,
                    $theme,
                    $media
                );
            } elseif ($dryRun && $author && !$isCurrentLineFail) {
                ++$importableProposals;
            }
        }
    }

    private function getMedia(?string $url): ?Media
    {
        if ($url && filter_var($url, \FILTER_VALIDATE_URL)) {
            $mediaBinaryFile = @file_get_contents($url);
            if (!$mediaBinaryFile) {
                return null;
            }
            $fileUrl = explode('/', $url);
            $mediaName = end($fileUrl);
            $filePath = '/tmp/' . $mediaName;
            file_put_contents($filePath, $mediaBinaryFile);

            return $this->mediaManager->createImageFromPath($filePath, $mediaName);
        }

        return null;
    }

    private function createProposal(
        array $row,
        User $author,
        ?ProposalDistrict $district,
        ?Status $status,
        ?Theme $theme,
        ?Media $media
    ): Proposal {
        $proposal = (new Proposal())
            ->setTitle(Text::escapeHtml($row['title']))
            ->setAuthor($author)
            ->setProposalForm($this->proposalForm)
            ->setDistrict($district)
            ->setStatus($status)
            ->setTheme($theme)
            ->setMedia($media)
            ->setPublishedAt(new \DateTime());
        if ($this->proposalForm->getUsingAddress() && !empty($row['address'])) {
            if (Text::isJSON($row['address'])) {
                $proposal->setAddress($row['address']);
            } else {
                $proposal->setAddress($this->map->getFormattedAddress($row['address']));
            }
        }
        if ($this->proposalForm->isUsingTipsmeee()) {
            $proposal->setTipsmeeeId($row['tipsmeeee']);
        }
        if ($this->proposalForm->isUsingEstimation() && !empty($row['estimation'])) {
            $proposal->setEstimation((float) $row['estimation']);
        }

        if ($this->proposalForm->isUsingCategories() && !empty($row['category'])) {
            $proposalCategory = $this->proposalCategoryRepository->findOneBy([
                'name' => trim($row['category']),
                'form' => $this->proposalForm,
            ]);
            $proposal->setCategory($proposalCategory);
        }

        if ($this->proposalForm->getUsingSummary() && !empty($row['summary'])) {
            $proposal->setSummary(Text::escapeHtml($row['summary']));
        }
        if ($this->proposalForm->getUsingDescription() && !empty($row['body'])) {
            $proposal->setBody($row['body']);
        }

        if ($this->proposalForm->isUsingAnySocialNetworks()) {
            ProposalMutation::hydrateSocialNetworks(
                $row,
                $proposal,
                $this->proposalForm,
                true,
                false
            );
        }
        if (\count($this->proposalForm->getCustomFields()) > 0) {
            foreach ($this->proposalForm->getRealQuestions() as $question) {
                if (\in_array($question->getTitle(), $this->customFields, true)) {
                    $this->questionsMap[$question->getTitle()] = $question;
                }
            }
            foreach ($this->customFields as $questionTitle) {
                $response = (new ValueResponse())
                    ->setQuestion($this->proposalForm->getQuestionByTitle($questionTitle))
                    ->setValue($row[$questionTitle] ?? '');
                $proposal->addResponse($response);
            }
        }

        return $proposal;
    }
}
