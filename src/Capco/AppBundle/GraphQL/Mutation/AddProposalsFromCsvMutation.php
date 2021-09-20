<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Import\ImportProposalsFromCsv;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Utils\Map;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class AddProposalsFromCsvMutation implements MutationInterface
{
    public const EMPTY_FILE = 'EMPTY_FILE';
    public const BAD_DATA_MODEL = 'BAD_DATA_MODEL';
    public const PROPOSAL_FORM_NOT_FOUND = 'PROPOSAL_FORM_NOT_FOUND';
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
    protected ImportProposalsFromCsv $importProposalsFromCsv;
    protected ProposalFormRepository $proposalFormRepository;
    private ConnectionBuilder $connectionBuilder;
    private MediaRepository $mediaRepository;
    private EntityManagerInterface $em;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        LoggerInterface $logger,
        ImportProposalsFromCsv $importProposalsFromCsv,
        ConnectionBuilder $connectionBuilder,
        MediaRepository $mediaRepository,
        EntityManagerInterface $em
    ) {
        $this->mediaRepository = $mediaRepository;
        $this->logger = $logger;
        $this->importProposalsFromCsv = $importProposalsFromCsv;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->connectionBuilder = $connectionBuilder;
        $this->em = $em;
    }

    public function __invoke(Arg $input): array
    {
        /** @var Media $media */
        $media = $this->mediaRepository->find($input->offsetGet('csvToImport'));
        $this->importProposalsFromCsv->setFilePath(
            '/public/media/default/0001/01/' . $media->getProviderReference()
        );
        $this->importProposalsFromCsv->setDelimiter($input->offsetGet('delimiter'));
        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepository->find($input->offsetGet('proposalFormId'));
        if (!$proposalForm) {
            return [
                'importableProposals' => 0,
                'importedProposals' => [],
                'badLines' => [],
                'duplicates' => [],
                'mandatoryMissing' => [],
                'errorCode' => self::PROPOSAL_FORM_NOT_FOUND,
            ];
        }
        $this->importProposalsFromCsv->setProposalForm($proposalForm);
        $dryRun = $input->offsetGet('dryRun');

        try {
            $proposals = $this->importProposalsFromCsv->import($dryRun, true);
            $this->em->remove($media);

            $proposals['importedProposals'] = $this->getConnection(
                $proposals['importedProposals'],
                $input
            );

            return [
                'importableProposals' => $proposals['importableProposals'],
                'importedProposals' => $proposals['importedProposals'],
                'badLines' => array_keys($proposals['badLines']),
                'duplicates' => $proposals['duplicates'],
                'mandatoryMissing' => array_keys($proposals['mandatoryMissing']),
                'errorCode' => null,
            ];
        } catch (\RuntimeException $exception) {
            switch ($exception->getMessage()) {
                case self::EMPTY_FILE:
                    return [
                        'importableProposals' => 0,
                        'importedProposals' => [],
                        'badLines' => [],
                        'duplicates' => [],
                        'mandatoryMissing' => [],
                        'errorCode' => self::EMPTY_FILE,
                    ];
                case self::BAD_DATA_MODEL:
                    return [
                        'importableProposals' => 0,
                        'importedProposals' => [],
                        'badLines' => [],
                        'duplicates' => [],
                        'mandatoryMissing' => [],
                        'errorCode' => self::BAD_DATA_MODEL,
                    ];
            }

            throw $exception;
        }
    }

    protected function getConnection(array $proposals, Argument $args): ConnectionInterface
    {
        $connection = $this->connectionBuilder->connectionFromArray(
            array_values($proposals),
            $args
        );
        $connection->setTotalCount(\count($proposals));

        return $connection;
    }
}
