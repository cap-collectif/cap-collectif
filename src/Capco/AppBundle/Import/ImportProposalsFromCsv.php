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
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Utils\Map;
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

        $rows = $this->getRecords();
        $rows->rewind();
        $count = \count(iterator_to_array($rows));

        if (0 === $count) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::EMPTY_FILE);
        }
        $rows->rewind();
        if (!$this->isValidHeaders($rows->current()->toArray())) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::BAD_DATA_MODEL);
        }
        $createdProposals = [];
        $proposalsFail = [];
        $mandatoryMissing = [];

        $duplicates = $this->getDuplicates($rows, $step);
        if (empty($step)) {
            throw new \RuntimeException('STEP_NOT_FOUND');
        }

        if ($output) {
            $progress = new ProgressBar($output, $count - 1);
            $progress->start();
        }

        $this->loopRows(
            $rows,
            $createdProposals,
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
            'badLines' => array_values($proposalsFail),
            'duplicates' => array_values($duplicates),
            'mandatoryMissing' => array_values($mandatoryMissing),
            'errorCode' => null,
        ];
    }

    protected function getRecords(): \Iterator
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->projectDir . $this->filePath);

        return $reader
            ->getSheetIterator()
            ->current()
            ->getRowIterator();
    }

    protected function isValidRow(array $row): bool
    {
        $fields = $this->proposalForm->getMandatoryFieldsUsed();
        foreach ($fields as $field => $mandatory) {
            if ($mandatory && empty($row[$this->headers[$field]])) {
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

    private function getDuplicates(iterable $rows, AbstractStep $step): array
    {
        $duplicates = [];
        $proposals = [];
        /** @var Row $row */
        foreach ($rows as $key => $row) {
            if (1 === $key) {
                continue;
            }
            $row = $row->toArray();
            $current = [$row[$this->headers['title']], $row[$this->headers['author']]];
            if (\in_array($current, $proposals)) {
                $duplicates[] = $key;
            } elseif (
                $this->proposalRepository->getProposalByEmailAndTitleOnStep(
                    $row[$this->headers['title']],
                    $row[$this->headers['author']],
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
        \Iterator $rows,
        array &$proposals,
        array &$proposalsFail,
        array &$mandatoryMissing,
        array $duplicates,
        bool $dryRun = true
    ) {
        /** @var Row $row */
        foreach ($rows as $key => $row) {
            $row = $row->toArray();
            // is line in doubloon, line is skipped
            if (\in_array($key, $duplicates)) {
                continue;
            }
            // first line is the header, skipped it
            if (1 === $key) {
                continue;
            }
            // if row is not valid
            if (!$this->isValidRow($row)) {
                $mandatoryMissing[] = $key;

                continue;
            }

            try {
                $district = null;
                if (
                    $this->proposalForm->isUsingDistrict() &&
                    !empty($row[$this->headers['district']])
                ) {
                    if (
                        !($district = $this->districtRepository->findDistrictByName(
                            trim($row[$this->headers['district']])
                        ))
                    ) {
                        $proposalsFail[] = $key;

                        continue;
                    }
                }
                $status = $this->proposalForm->getStep()->getDefaultStatus();
                if (isset($this->headers['status']) && !empty($row[$this->headers['status']])) {
                    if (
                        !($status = $this->statusRepository->findOneBy([
                            'name' => trim($row[$this->headers['status']]),
                            'step' => $this->proposalForm->getStep(),
                        ]))
                    ) {
                        $proposalsFail[] = $key;

                        continue;
                    }
                }
                $theme = null;
                if ($this->proposalForm->isUsingThemes() && !empty($row[$this->headers['theme']])) {
                    if (
                        !($theme = $this->themeRepository->findOneWithTitle(
                            trim($row[$this->headers['theme']])
                        ))
                    ) {
                        $proposalsFail[] = $key;

                        continue;
                    }
                }
                if (
                    !($author = $this->userRepository->findOneByEmail(
                        $row[$this->headers['author']]
                    ))
                ) {
                    $proposalsFail[] = $key;

                    continue;
                }
                $media = null;
                if (
                    $this->proposalForm->isUsingIllustration() &&
                    !empty($row[$this->headers['media_url']])
                ) {
                    if (!($media = $this->getMedia($row[$this->headers['media_url']]))) {
                        $proposalsFail[] = $key;

                        continue;
                    }
                }
            } catch (\Exception $exception) {
                $this->logger->error($exception->getMessage());

                $proposalsFail[] = $key;

                continue;
            }

            if (!$dryRun) {
                $proposals[] = $this->createProposal(
                    $row,
                    $author,
                    $district,
                    $status,
                    $theme,
                    $media
                );
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
            ->setTitle(Text::escapeHtml($row[$this->headers['title']]))
            ->setAuthor($author)
            ->setProposalForm($this->proposalForm)
            ->setDistrict($district)
            ->setStatus($status)
            ->setTheme($theme)
            ->setMedia($media)
            ->setPublishedAt(new \DateTime());
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
            foreach ($this->proposalForm->getRealQuestions() as $question) {
                if (\in_array($question->getTitle(), $this->customFields, true)) {
                    $this->questionsMap[$question->getTitle()] = $question;
                }
            }
            foreach ($this->customFields as $questionTitle) {
                $response = (new ValueResponse())
                    ->setQuestion($this->proposalForm->getQuestionByTitle($questionTitle))
                    ->setValue($row[$this->headers[$questionTitle]] ?? '');
                $proposal->addResponse($response);
            }
        }

        return $proposal;
    }
}
