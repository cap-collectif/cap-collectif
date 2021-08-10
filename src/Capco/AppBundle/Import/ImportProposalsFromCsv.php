<?php

namespace Capco\AppBundle\Import;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
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
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;

class ImportProposalsFromCsv
{
    private ?string $projectDir;
    private ?string $filePath;
    private ?string $delimiter;
    private ?ProposalForm $proposalForm;
    private array $customFields = [];
    private EntityManagerInterface $om;
    private MediaManager $mediaManager;
    private ProposalDistrictRepository $districtRepository;
    private ProposalCategoryRepository $proposalCategoryRepository;
    private ProposalRepository $proposalRepository;
    private StatusRepository $statusRepository;
    private UserRepository $userRepository;
    private Map $map;
    private array $headers;
    private LoggerInterface $logger;
    private ThemeRepository $themeRepository;
    private Indexer $indexer;
    private array $createdProposals = [];
    private int $importableProposals = 0;
    private array $badData = [];
    private array $mandatoryMissing = [];

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

    public function setProposalForm(ProposalForm $proposalForm): void
    {
        $this->proposalForm = $proposalForm;
    }

    public function setFilePath(string $filePath): void
    {
        $this->filePath = $filePath;
    }

    public function setDelimiter(string $delimiter): void
    {
        $this->delimiter = $delimiter;
    }

    public function setCustomFields(array $customFields): void
    {
        $this->customFields = $customFields;
    }

    public function import(bool $dryRun = true, ?OutputInterface $output = null): array
    {
        $this->setCustomFields($this->proposalForm->getCustomFields());
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
        if (empty($this->proposalForm->getStep())) {
            throw new \RuntimeException('STEP_NOT_FOUND');
        }

        $duplicates = $this->getDuplicates($associativeRowsWithHeaderLine);
        if ($output) {
            $progress = new ProgressBar($output, $count - 1);
            $progress->start();
        }
        $this->importableProposals = 0;
        $this->loopRows($associativeRowsWithHeaderLine, $duplicates, $dryRun);

        if (!$dryRun && !empty($this->createdProposals)) {
            try {
                foreach ($this->createdProposals as $proposal) {
                    $this->om->persist($proposal);
                }
                $this->om->flush();
                foreach ($this->createdProposals as $proposal) {
                    $this->indexer->index(Proposal::class, $proposal->getId());
                }
                $this->indexer->finishBulk();
                if ($output) {
                    $progress->finish();
                }
            } catch (\RuntimeException $e) {
                $this->logger->error('Error when flushing proposals : '.$e->getMessage());

                throw $e;
            }
        }

        return [
            'importedProposals' =>
                !$dryRun && !empty($this->createdProposals) ? $this->createdProposals : [],
            'importableProposals' => $this->importableProposals,
            'badLines' => $this->badData,
            'duplicates' => array_values($duplicates),
            'mandatoryMissing' => $this->mandatoryMissing,
            'errorCode' => null,
        ];
    }

    public function checkIfCustomQuestionResponseIsValid(array $row, int $key): bool
    {
        foreach ($this->customFields as $questionTitle) {
            $question = $this->proposalForm->getQuestionByTitle($questionTitle);
            if (
                $question instanceof MultipleChoiceQuestion &&
                \in_array($question->getType(), [
                    AbstractQuestion::QUESTION_TYPE_RADIO,
                    AbstractQuestion::QUESTION_TYPE_BUTTON,
                    AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION,
                ]) &&
                !$question->isChoiceValid(trim($row[$questionTitle])) &&
                !$question->isOtherAllowed()
            ) {
                $this->badData = $this->incrementBadData($this->badData, $key);
                $this->logger->error(
                    sprintf('bad data for question %s in line %d', trim($row[$questionTitle]), $key)
                );

                return false;
            }
        }

        return true;
    }

    private function getRecords(): Reader
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->projectDir.$this->filePath);

        return $reader;
    }

    private function getAssociativeRowsColumns(Reader $reader): array
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

    private function isValidRow(array $row, array $mandatoryMissing, int $key): array
    {
        $fields = $this->proposalForm->getMandatoryFieldsUsed();
        foreach ($fields as $field => $mandatory) {
            if ($mandatory && empty($row[$field])) {
                $mandatoryMissing = $this->incrementBadData($mandatoryMissing, $key);
            }
        }

        return $mandatoryMissing;
    }

    private function isValidHeaders(array $fileHeader): bool
    {
        return array_flip($fileHeader) === $this->headers;
    }

    private function setProposalReference(Proposal $proposal): void
    {
        $lastEntity = $this->proposalRepository->findOneBy([], ['reference' => 'DESC']);

        if (null === $lastEntity) {
            $proposal->setReference(1);
        } else {
            $proposal->setReference($lastEntity->getReference() + 1);
        }
    }

    private function getDuplicates(array $rows): array
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
                $this->proposalRepository->getProposalByEmailAndTitleOnProposalForm(
                    trim($row['title']),
                    trim($row['author']),
                    $this->proposalForm
                ) > 0
            ) {
                $duplicates[] = $key;
            }
            $proposals[] = $current;
        }

        return $duplicates;
    }

    private function loopRows(array $rows, array $duplicates, bool $dryRun = true)
    {
        foreach ($rows as $key => $row) {
            $isCurrentLineFail = false;
            // array start at 0, csv start at 1
            ++$key;
            // skip header
            if (1 === $key) {
                continue;
            }
            if (\in_array($key, $duplicates)) {
                continue;
            }

            // if row is not valid
            $this->mandatoryMissing = $this->isValidRow($row, $this->mandatoryMissing, $key);
            if (!empty($this->mandatoryMissing[$key])) {
                $this->logger->error('Mandatory missing in line '.$key);

                $isCurrentLineFail = true;
            }

            try {
                $category = $media = $theme = $district = null;
                if ($this->proposalForm->isUsingDistrict() && !empty($row['district'])) {
                    if (
                        !($district = $this->districtRepository->findDistrictByName(
                            trim($row['district'])
                        ))
                    ) {
                        $isCurrentLineFail = true;
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $this->logger->error('bad data district in line '.$key);
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
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $this->logger->error('bad data statute in line '.$key);
                    }
                }
                if ($this->proposalForm->isUsingThemes() && !empty($row['theme'])) {
                    if (
                        !($theme = $this->themeRepository->findOneWithTitle(
                            trim($row['theme'])
                        ))
                    ) {
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $isCurrentLineFail = true;
                        $this->logger->error('bad data theme in line '.$key);
                    }
                }
                if ($this->proposalForm->isUsingCategories() && !empty($row['category'])) {
                    if (
                        !($category = $this->proposalCategoryRepository->findOneBy([
                            'name' => trim($row['category']),
                            'form' => $this->proposalForm,
                        ]))
                    ) {
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $isCurrentLineFail = true;
                        $this->logger->error(
                            sprintf(
                                'bad data category in line %d, for category %s',
                                $key,
                                trim($row['category'])
                            )
                        );
                    }
                }
                if (!($author = $this->userRepository->findOneByEmail(trim($row['author'])))) {
                    $this->badData = $this->incrementBadData($this->badData, $key);
                    $isCurrentLineFail = true;
                    $this->logger->error('bad data author in line '.$key);
                }
                if ($this->proposalForm->isUsingIllustration() && !empty($row['media_url'])) {
                    if (!($media = $this->getMedia($row['media_url']))) {
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $isCurrentLineFail = true;
                        $this->logger->error('bad data media_url in line '.$key);
                    }
                }
                if (
                    \count($this->proposalForm->getCustomFields()) > 0 &&
                    !$this->checkIfCustomQuestionResponseIsValid($row, $key)
                ) {
                    $isCurrentLineFail = true;
                }
            } catch (\Exception $exception) {
                $this->logger->error($exception->getMessage());

                throw $exception;
            }
            if (!$dryRun && !$isCurrentLineFail && $author) {
                $this->createdProposals[$key] = $this->createProposal(
                    $row,
                    $author,
                    $district,
                    $status,
                    $theme,
                    $category,
                    $media
                );
            } elseif ($dryRun && $author && !$isCurrentLineFail) {
                ++$this->importableProposals;
            }
        }
    }

    private function incrementBadData(array $badData, int $line): array
    {
        if (isset($badData[$line])) {
            ++$badData[$line];
        } else {
            $badData[$line] = 1;
        }

        return $badData;
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
            $filePath = '/tmp/'.$mediaName;
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
        ?ProposalCategory $category,
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
        if (isset($row['cost']) && is_numeric($row['cost'])) {
            $proposal->setEstimation($row['cost']);
        }
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
            $proposal->setEstimation((float)$row['estimation']);
        }

        if ($this->proposalForm->isUsingCategories()) {
            $proposal->setCategory($category);
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
        $this->setProposalReference($proposal);

        if (\count($this->proposalForm->getCustomFields()) > 0) {
            foreach ($this->customFields as $questionTitle) {
                $question = $this->proposalForm->getQuestionByTitle($questionTitle);
                $response = new ValueResponse();
                // SimpleQuestion and MultipleChoiceQuestion - Select
                $value = trim($row[$questionTitle]) ?? '';

                if (
                    $question instanceof MultipleChoiceQuestion &&
                    \in_array($question->getType(), [
                        AbstractQuestion::QUESTION_TYPE_RADIO,
                        AbstractQuestion::QUESTION_TYPE_BUTTON,
                        AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION,
                    ])
                ) {
                    $value = sprintf(
                        '{"labels":["%s"], "other": null}',
                        trim($row[$questionTitle]) ?? ''
                    );
                    if (!$question->isChoiceValid($value)) {
                        if ($question->isOtherAllowed()) {
                            $value = sprintf(
                                '{"labels":[], "other": "%s"}',
                                trim($row[$questionTitle]) ?? ''
                            );
                        }
                    }
                }
                $response = $response->setQuestion($question)->setValue($value);
                $proposal->addResponse($response);
            }
        }

        return $proposal;
    }
}
