<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Exception\IOException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\CSV\Writer;
use Capco\AppBundle\Command\Utils\BooleanCell;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Routing\RouterInterface;

class ExportDebateCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    final public const HEADER_ARGUMENT = [
        'argument_createdAt' => 'createdAt',
        'argument_publishedAt' => 'publishedAt',
        'argument_updatedAt' => 'updatedAt',
        'argument_trashedAt' => 'trashedAt',
        'argument_trashedReason' => 'trashedReason',

        'argument_author_id' => 'author.id',
        'argument_author_username' => 'argument_author_username',
        'argument_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'argument_author_email' => 'argument_author_email',
        'argument_author_userType_name' => 'author.userType.name',
        'argument_author_zipCode' => 'author.zipCode',
        'argument_author_account' => 'argument_author_account',
        'argument_author_internal_communication' => 'argument_author_internal_communication',
        'argument_author_external_communication' => 'argument_author_external_communication',

        'argument_content' => 'body',
        'argument_type' => 'type',
        'argument_voteNumber' => 'votes.totalCount',

        'debate_url' => 'url',
    ];

    final public const HEADER_VOTE = [
        'vote_publishedAt' => 'publishedAt',
        'vote_type' => 'type',

        'vote_source' => 'vote_source',

        'vote_author_id' => 'author.id',
        'vote_author_zipCode' => 'author.zipCode',
        'vote_author_username' => 'author.username',
        'vote_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'vote_author_email' => 'author.email',
        'vote_author_userType_name' => 'author.userType.name',

        'debate_url' => 'url',
    ];

    private const EXPORT_DIR = '/public/export/';

    protected static $defaultName = 'capco:export:debate';
    protected string $projectRootDir;

    public function __construct(
        protected Executor $executor,
        GraphQlAclListener $listener,
        private readonly DebateRepository $debateRepository,
        ExportUtils $exportUtils,
        private readonly RouterInterface $router,
        string $projectRootDir
    ) {
        parent::__construct($exportUtils);
        $listener->disableAcl();
        $this->configureSnapshot();
        $this->projectRootDir = $projectRootDir;
    }

    public static function getFilename(
        string $debateId,
        string $type,
        bool $projectAdmin = false
    ): string {
        if ($projectAdmin) {
            return self::getShortenedFilename("debate-{$debateId}-{$type}-project-admin");
        }

        return self::getShortenedFilename("debate-{$debateId}-{$type}");
    }

    protected function configure(): void
    {
        parent::configure();
        $this->addOption(
            'debate-id',
            'di',
            InputOption::VALUE_OPTIONAL,
            'id of the debate to export'
        );
        $this->addOption(
            'arguments-order',
            'ao',
            InputOption::VALUE_OPTIONAL,
            'order the arguments as PUBLICATION_DESC, PUBLICATION_ASC, VOTES_DESC, VOTES_ASC'
        );
        $this->addOption(
            'votes-order',
            'vo',
            InputOption::VALUE_OPTIONAL,
            'order the votes as PUBLICATION_DESC, PUBLICATION_ASC, CREATION_DESC, CREATION_ASC'
        );
        $this->addOption(
            'geoip',
            'g',
            InputOption::VALUE_NONE,
            'use to add geo_ip location columns'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        foreach ($this->getDebateIds($input) as $debateId) {
            $arguments = [];
            $votes = [];

            $debate = $this->debateRepository->find($debateId);
            $owner = $debate ? $debate->getProject()->getOwner() : null;
            $isProjectAdmin = $owner instanceof User && $owner->isOnlyProjectAdmin();
            $geoIp = $input->getOption('geoip');

            $url = $this->loadDataAndGetUrl(
                $debateId,
                $arguments,
                $votes,
                $input->getOption('arguments-order'),
                $input->getOption('votes-order'),
                $isProjectAdmin,
                $geoIp
            );
            $this->generateArgumentsAndVotesCSV(
                $output,
                $debateId,
                $arguments,
                $votes,
                $url,
                $input->getOption('delimiter'),
                $input->getOption('verbose'),
                $isProjectAdmin,
                $geoIp
            );

            if ($isProjectAdmin) {
                $arguments = [];
                $votes = [];

                $url = $this->loadDataAndGetUrl(
                    $debateId,
                    $arguments,
                    $votes,
                    $input->getOption('arguments-order'),
                    $input->getOption('votes-order'),
                    false,
                    $geoIp
                );
                $this->generateArgumentsAndVotesCSV(
                    $output,
                    $debateId,
                    $arguments,
                    $votes,
                    $url,
                    $input->getOption('delimiter'),
                    $input->getOption('verbose'),
                    false,
                    $geoIp
                );
            }
        }

        return 0;
    }

    private function generateArgumentsAndVotesCSV(
        OutputInterface $output,
        string $debateId,
        array $arguments,
        array $votes,
        string $url,
        string $delimiter,
        bool $isVerbose,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): void {
        $this->generateCSV(
            $output,
            $debateId,
            'arguments',
            $arguments,
            $url,
            $delimiter,
            $isVerbose,
            $projectAdmin,
            $geoIp
        );
        $this->generateCSV(
            $output,
            $debateId,
            'votes',
            $votes,
            $url,
            $delimiter,
            $isVerbose,
            $projectAdmin,
            $geoIp
        );
    }

    private function generateCSV(
        OutputInterface $output,
        string $debateId,
        string $type,
        array $data,
        string $url,
        string $delimiter,
        bool $isVerbose,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): void {
        $output->writeln("<info>Generating {$type} of debate {$debateId}...</info>");
        $path = $this->getPath($debateId, $type, $projectAdmin);

        $writer = WriterFactory::create(Type::CSV, $delimiter);

        try {
            $writer->openToFile($path);
        } catch (IOException $e) {
            throw new \RuntimeException('Error while opening file: ' . $e->getMessage());
        }

        try {
            self::addHeader($writer, $type, $projectAdmin, $geoIp);
            self::fillDocument(
                $writer,
                $type,
                $data,
                $url,
                $output,
                $isVerbose,
                $projectAdmin,
                $geoIp
            );
        } catch (IOException $e) {
            throw new \RuntimeException('Error while writing on file: ' . $e->getMessage());
        }

        if ($isVerbose) {
            $output->writeln("<info>\tPath : {$path}</info>");
        }
    }

    private static function addHeader(
        Writer $writer,
        string $type,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): void {
        $writer->addRow(
            WriterEntityFactory::createRowFromArray(
                array_keys(self::getHeader($type, $projectAdmin, $geoIp))
            )
        );
    }

    private static function fillDocument(
        Writer $writer,
        string $type,
        array $data,
        string $url,
        OutputInterface $output,
        bool $isVerbose,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): void {
        $forCount = 0;
        $againstCount = 0;

        foreach ($data as $datum) {
            $datum = $datum['node'];
            $datum['url'] = $url;
            self::addRowToDocument($writer, $datum, $type, $projectAdmin, $geoIp);

            if ($isVerbose) {
                if ('FOR' === $datum['type']) {
                    ++$forCount;
                } else {
                    ++$againstCount;
                }
            }
        }

        if ($isVerbose) {
            $output->writeln("\t<info>Adding {$forCount} {$type} FOR.</info>");
            $output->writeln("\t<info>Adding {$againstCount} {$type} AGAINST.</info>");
        }
    }

    private static function addRowToDocument(
        Writer $writer,
        array $argumentData,
        string $type,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): void {
        $rowContent = [];

        foreach (self::getHeader($type, $projectAdmin, $geoIp) as $headerPath) {
            $cellValue = self::getRowCellValue($argumentData, $headerPath);
            $rowContent[] = $cellValue;
        }

        $writer->addRow(WriterEntityFactory::createRowFromArray($rowContent));
    }

    private function getPath(string $debateId, string $type, bool $projectAdmin = false): string
    {
        return $this->projectRootDir .
            self::EXPORT_DIR .
            self::getFilename($debateId, $type, $projectAdmin);
    }

    private static function getRowCellValue(array $data, string $treePath)
    {
        if ('vote_source' === $treePath) {
            return self::getRowCellValueVoteOrigin($data);
        }
        if ('argument_author_username' === $treePath) {
            return self::hasAccount($data) ? $data['author']['username'] : $data['username'];
        }
        if ('argument_author_email' === $treePath) {
            return self::hasAccount($data) ? $data['author']['email'] : $data['email'];
        }
        if ('argument_author_account' === $treePath) {
            return BooleanCell::toString(self::hasAccount($data));
        }
        if ('argument_author_internal_communication' === $treePath) {
            return BooleanCell::toString(
                self::hasAccount($data)
                    ? $data['author']['consentInternalCommunication']
                    : $data['consentInternalCommunication']
            );
        }
        if ('argument_author_external_communication' === $treePath) {
            return BooleanCell::toString(
                self::hasAccount($data) ?? $data['author']['consentInternalCommunication']
            );
        }
        $treePathParts = explode('.', $treePath);
        if (1 === \count($treePathParts)) {
            return $data[$treePath] ?? '';
        }
        $value = $data;
        foreach ($treePathParts as $treePathPart) {
            if (!$value || !\array_key_exists($treePathPart, $value)) {
                return '';
            }
            $value = $value[$treePathPart];
        }

        return $value ?? '';
    }

    private static function getRowCellValueVoteOrigin(array $data): string
    {
        if ('WIDGET' === $data['origin'] && $data['widgetOriginUrl']) {
            return 'WIDGET : ' . $data['widgetOriginUrl'];
        }
        if ('INTERNAL' === $data['origin']) {
            return 'APPLICATION';
        }

        return $data['origin'];
    }

    private function getDebateIds(InputInterface $input): array
    {
        return $input->getOption('debate-id')
            ? [$input->getOption('debate-id')]
            : $this->debateRepository->findAllIds();
    }

    private function loadDataAndGetUrl(
        string $debateId,
        array &$arguments,
        array &$votes,
        ?string $argumentsOrder = null,
        ?string $votesOrder = null,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): string {
        $globalId = GlobalId::toGlobalId('Debate', $debateId);

        $argumentCursor = null;
        $voteCursor = null;
        do {
            $data = $this->executor
                ->execute('internal', [
                    'query' => self::getGraphQLQuery(
                        $globalId,
                        $argumentCursor,
                        $voteCursor,
                        $argumentsOrder,
                        $votesOrder,
                        $projectAdmin,
                        $geoIp
                    ),
                    'variables' => [],
                ])
                ->toArray()
            ;
            if (isset($data['errors']) && !empty($data['errors'])) {
                throw new \RuntimeException($data['errors'][0]['message']);
            }
            if (null === $data) {
                throw new \RuntimeException("debate not found : {$debateId}");
            }

            $url = $data['data']['node']['url'];
            $dataArguments = $data['data']['node']['arguments'];
            $dataVotes = $data['data']['node']['votes'];
            $hasNextPage =
                $dataArguments['pageInfo']['hasNextPage'] || $dataVotes['pageInfo']['hasNextPage'];
            $argumentCursor = $dataArguments['pageInfo']['endCursor'];
            $voteCursor = $dataVotes['pageInfo']['endCursor'];
            $arguments = array_merge($arguments, $dataArguments['edges']);
            $votes = array_merge($votes, $dataVotes['edges']);
        } while ($hasNextPage);

        return $url;
    }

    private static function getHeader(
        string $type,
        bool $projectAdmin = false,
        bool $geoIP = false
    ): array {
        $headersArgument = self::HEADER_ARGUMENT;
        $headersVote = self::HEADER_VOTE;

        if ($geoIP) {
            $headersVote['vote_geoip_country_name'] = 'geoip.countryName';
            $headersVote['vote_geoip_region_name'] = 'geoip.regionName';
            $headersVote['vote_geoip_city_name'] = 'geoip.cityName';
            $headersArgument['argument_geoip_country_name'] = 'geoip.countryName';
            $headersArgument['argument_geoip_region_name'] = 'geoip.regionName';
            $headersArgument['argument_geoip_city_name'] = 'geoip.cityName';
        }

        if ($projectAdmin) {
            unset(
                $headersArgument['argument_author_email'],
                $headersArgument['argument_author_isEmailConfirmed'],
                $headersVote['vote_author_email'],
                $headersVote['vote_author_isEmailConfirmed']
            );
        }

        if ('arguments' === $type) {
            return $headersArgument;
        }

        return $headersVote;
    }

    private static function getGraphQLQuery(
        string $debateId,
        ?string $argumentsCursor = null,
        ?string $votesCursor = null,
        ?string $argumentsOrder = null,
        ?string $votesOrder = null,
        bool $projectAdmin = false,
        bool $geoIp = false
    ): string {
        $argumentsOptions = self::getQueryOptions($argumentsCursor, $argumentsOrder);
        $votesOptions = self::getQueryOptions($votesCursor, $votesOrder);
        $USER_TYPE_FRAGMENT = GraphqlQueryAndCsvHeaderHelper::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = $projectAdmin
            ? GraphqlQueryAndCsvHeaderHelper::AUTHOR_INFOS_ANONYMOUS_FRAGMENT
            : GraphqlQueryAndCsvHeaderHelper::AUTHOR_INFOS_FRAGMENT;
        $geoIpPart = $geoIp
            ? 'geoip {
          countryName
          regionName
          cityName
        }'
            : '';

        return <<<EOF
            {$USER_TYPE_FRAGMENT}
            {$AUTHOR_INFOS_FRAGMENT}
            {
              node(id: "{$debateId}") {
                ... on Debate {
                  id
                  url
                  arguments {$argumentsOptions} {
                    edges {
                      node {
                        createdAt
                        publishedAt
                        updatedAt
                        trashedAt
                        trashedReason
                        {$geoIpPart}
                        ... on DebateArgument {
                          author {
                            zipCode
                            ...authorInfos
                            consentInternalCommunication
                            consentExternalCommunication
                          }
                        }
                        ... on DebateAnonymousArgument {
                            username
                            email
                            consentInternalCommunication
                        }
                        body
                        type
                        votes {
                          totalCount
                        }
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                  votes {$votesOptions} {
                    edges {
                      node {
                        publishedAt
                        type
                        origin
                        widgetOriginUrl
                        ...on DebateAnonymousVote {
                          geoip {
                            countryName
                            regionName
                            cityName
                          }
                        }
                        ...on DebateVote {
                          geoip {
                            countryName
                            regionName
                            cityName
                          }
                          author {
                            zipCode
                            ...authorInfos
                          }
                        }
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
            }
            EOF;
    }

    private static function getQueryOptions(?string $cursor, ?string $order): string
    {
        $options = '';
        if ($cursor || $order) {
            $options .= '(';
        }
        if ($cursor) {
            $options .= 'after: "' . $cursor . '"';
        }
        if ($cursor && $order) {
            $options .= ', ';
        }
        if ($order) {
            $options .= self::getOrder($order);
        }
        if ($cursor || $order) {
            $options .= ')';
        }

        return $options;
    }

    private static function getOrder(?string $orderOption): ?string
    {
        switch ($orderOption) {
            case null:
                return null;

            case 'PUBLICATION_DESC':
                return 'orderBy: {field:PUBLISHED_AT, direction: DESC}';

            case 'PUBLICATION_ASC':
                return 'orderBy: {field:PUBLISHED_AT, direction: ASC}';

            case 'CREATION_DESC':
                return 'orderBy: {field:CREATED_AT, direction: DESC}';

            case 'CREATION_ASC':
                return 'orderBy: {field:CREATED_AT, direction: ASC}';

            case 'VOTES_DESC':
                return 'orderBy: {field:VOTE_COUNT, direction: DESC}';

            case 'VOTES_ASC':
                return 'orderBy: {field:VOTE_COUNT, direction: ASC}';

            default:
                throw new \RuntimeException('unknown order value ' . $orderOption);
        }
    }

    private static function hasAccount(array $data): bool
    {
        return isset($data['author']) && \is_array($data['author']);
    }
}
