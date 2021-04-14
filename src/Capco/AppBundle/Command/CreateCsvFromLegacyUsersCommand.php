<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Utils\Text;
use Capco\AppBundle\Toggle\Manager;
use Box\Spout\Writer\WriterInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromLegacyUsersCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const FILENAME = 'legacyUsers.csv';

    private const VALUE_RESPONSE_TYPENAME = 'ValueResponse';
    private const MEDIA_RESPONSE_TYPENAME = 'MediaResponse';
    protected ConnectionTraversor $connectionTraversor;
    protected Executor $executor;
    protected string $projectRootDir;

    /**
     * @var WriterInterface
     */
    protected $writer;

    protected array $userHeaderMap = [
        'id' => 'id',
        'email' => 'email',
        'username' => 'username',
        'createdAt' => 'createdAt',
        'updatedAt' => 'updatedAt',
        'lastLogin' => 'lastLogin',
        'rolesText' => 'rolesText',
        'enabled' => 'enabled',
        'isEmailConfirmed' => 'emailConfirmed',
        'confirmedAccountAt' => 'confirmedAccountAt',
        'locked' => 'locked',
        'phoneConfirmed' => 'phoneConfirmed',
        'phoneConfirmationSentAt' => 'phoneConfirmationSentAt',
        'userType.name' => 'userType.name',
        'consentExternalCommunication' => 'consentExternalCommunication',
        'consentInternalCommunication' => 'consentInternalCommunication',
        'gender' => 'gender',
        'firstname' => 'firstname',
        'lastname' => 'lastname',
        'dateOfBirth' => 'dateOfBirth',
        'websiteUrl' => 'websiteUrl',
        'biography' => 'biography',
        'postalAddress.formatted' => 'postalAddress',
        'address' => 'address',
        'address2' => 'address2',
        'zipCode' => 'zipCode',
        'city' => 'city',
        'phone' => 'phone',
        'url' => 'url',
        'googleId' => 'googleId',
        'facebookId' => 'facebookId',
        'samlId' => 'samlId',

        'contributions.totalCount' => 'contributionsCount',
        'opinions.totalCount' => 'opinionsCount',
        'opinionVotesCount' => 'opinionVotesCount',
        'opinionVersions.totalCount' => 'opinionVersionsCount',

        'arguments.totalCount' => 'arguments.totalCount',
        'argumentVotesCount' => 'argumentVotesCount',
        'proposals.totalCount' => 'proposalsCount',
        'proposalVotesCount' => 'proposalVotesCount',
        'sources.totalCount' => 'sourcesCount',
        'replies.totalCount' => 'repliesCount',
        'deletedAccountAt' => 'deletedAccountAt',
    ];

    private $customQuestions;
    private Manager $toggleManager;

    public function __construct(
        GraphQlAclListener $listener,
        ExportUtils $exportUtils,
        Manager $toggleManager,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        $this->toggleManager = $toggleManager;
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:legacyUsers')->setDescription(
            'Create csv file from consultation step data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (
            !$this->toggleManager->isActive(Manager::export) &&
            $this->toggleManager->isActive(Manager::export_legacy_users)
        ) {
            $output->writeln('Feature "export" and "export_legacy_users" must be enabled.');

            return 1;
        }

        $requestString = $this->getUsersGraphQLQuery();
        $data = $this->executor
            ->execute('internal', [
                'query' => $requestString,
                'variables' => [],
            ])
            ->toArray();
        $this->writer = WriterFactory::create(Type::CSV, $input->getOption('delimiter'));
        $this->writer->openToFile(
            sprintf('%s/public/export/%s', $this->projectRootDir, self::FILENAME)
        );
        $this->customQuestions = $this->generateSheetHeaderQuestions();

        $header = $this->generateSheetHeader();

        $this->writer->addRow(WriterEntityFactory::createRowFromArray($header));

        $totalCount = Arr::path($data, 'data.users.totalCount');
        $progress = new ProgressBar($output, (int) $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'users',
            function ($edge) use ($progress) {
                $progress->advance();
                $user = $edge['node'];
                $this->addUserRow($user);
            },
            function ($pageInfo) {
                return $this->getUsersGraphQLQuery($pageInfo['endCursor']);
            }
        );

        $this->executeSnapshot($input, $output, self::FILENAME);

        $progress->finish();

        $output->writeln('The export file "' . self::FILENAME . '" has been created.');

        return 0;
    }

    /**
     * @param $user
     *
     * @throws \Box\Spout\Common\Exception\IOException
     * @throws \Box\Spout\Writer\Exception\WriterNotOpenedException
     */
    private function addUserRow($user): void
    {
        $row = [];
        foreach ($this->userHeaderMap as $path => $columnName) {
            $arr = explode('.', $path);
            $val = $user;
            foreach ($arr as $a) {
                if (isset($val[$a])) {
                    $val = $val[$a];
                } else {
                    $val = '';

                    break;
                }
            }
            if (\is_bool($val)) {
                $val = $val ? 'Yes' : 'No';
            }
            $row[] = $val;
        }
        $customQuestionLength = \count($this->customQuestions);
        if ($customQuestionLength > 0) {
            $responses = array_map(function ($edge) {
                return $edge['node'];
            }, Arr::path($user, 'responses.edges'));
            $i = 0;
            while ($i < \count($responses)) {
                $value = $this->addCustomResponse($responses[$i]);
                $cleanValue = Text::cleanNewline($value);

                $row[] = $this->exportUtils->parseCellValue($cleanValue);
                ++$i;
            }
            while ($i < $customQuestionLength) {
                $row[] = '';
                ++$i;
            }
        }
        $this->writer->addRow(WriterEntityFactory::createRowFromArray($row));
    }

    private function getUsersGraphQLQuery(?string $userCursor = null): string
    {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        return <<<EOF
{
  users(superAdmin: false, first: 100 ${userCursor}, withDisabled: true) {
    totalCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        email
        username
        createdAt
        updatedAt
        lastLogin
        rolesText
        enabled
        confirmedAccountAt
        isEmailConfirmed
        locked
        phoneConfirmed
        phoneConfirmationSentAt
        userType {
          name
        }
        responses {
          edges {
            node {
              __typename
              question {
                title
              }
              ... on ValueResponse {
                formattedValue
              }
              ... on MediaResponse {
                medias {
                  url
                }
              }
            }
          }
        }
        consentExternalCommunication
        consentInternalCommunication
        gender
        firstname
        lastname
        dateOfBirth
        websiteUrl
        biography
        postalAddress {
          formatted
        }
        address
        address2
        zipCode
        city
        phone
        url
        googleId
        facebookId
        samlId
        contributions {
            totalCount
        }
        opinionVotesCount
        arguments(includeTrashed: true) {
            totalCount
        }
        argumentVotesCount
        proposals {
            totalCount
        }
        opinionVersions {
            totalCount
        }
        proposalVotesCount
        sources {
            totalCount
        }
        replies {
            totalCount
        }
        opinions {
            totalCount
        }
        deletedAccountAt
      }
    }
  }
}
EOF;
    }

    private function generateSheetHeaderQuestions(): array
    {
        $registrationFormQuestionsQuery = <<<'EOF'
            {
                registrationForm {
                    questions {
                        title
                    }
                }
            }
EOF;

        $questionsTitles = $this->executor
            ->execute('internal', [
                'query' => $registrationFormQuestionsQuery,
                'variables' => [],
            ])
            ->toArray();

        return array_map(function (array $edge) {
            return $edge['title'];
        }, $questionsTitles['data']['registrationForm']['questions']);
    }

    private function generateSheetHeader(): array
    {
        return array_merge(array_values($this->userHeaderMap), $this->customQuestions);
    }

    private function addCustomResponse(array $response): ?string
    {
        switch ($response['__typename']) {
            case self::VALUE_RESPONSE_TYPENAME:
                return $response['formattedValue'];
            case self::MEDIA_RESPONSE_TYPENAME:
                return implode(
                    ', ',
                    array_map(function (array $media) {
                        return $media['url'];
                    }, $response['medias'])
                );

            default:
                throw new \LogicException('Unknown response typename');
        }
    }
}
