<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Utils\Text;
use Box\Spout\Writer\WriterFactory;
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

class CreateCsvFromUsersCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const VALUE_RESPONSE_TYPENAME = 'ValueResponse';
    private const MEDIA_RESPONSE_TYPENAME = 'MediaResponse';
    protected $connectionTraversor;
    protected $listener;
    protected $executor;
    protected $projectRootDir;

    /**
     * @var WriterInterface
     */
    protected $writer;

    protected $userHeaderMap = [
        'id' => 'id',
        'email' => 'email',
        'username' => 'username',
        'createdAt' => 'createdAt',
        'updatedAt' => 'updatedAt',
        'lastLogin' => 'lastLogin',
        'rolesText' => 'rolesText',
        'enabled' => 'enabled',
        'isEmailConfirmed' => 'emailConfirmed',
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
        'address' => 'address',
        'address2' => 'address2',
        'zipCode' => 'zipCode',
        'city' => 'city',
        'phone' => 'phone',
        'url' => 'url',
        'googleId' => 'googleId',
        'facebookId' => 'facebookId',
        'samlId' => 'samlId',

        'opinions.totalCount' => 'opinionsCount',
        'opinionVotesCount' => 'opinionVotesCount',
        'opinionVersions.totalCount' => 'opinionVersionsCount',

        'arguments.totalCount' => 'arguments.totalCount',
        'argumentVotesCount' => 'argumentVotesCount',
        'proposals.totalCount' => 'proposalsCount',
        'proposalVotesCount' => 'proposalVotesCount',
        'commentVotes.totalCount' => 'commentVotesCount',
        'sources.totalCount' => 'sourcesCount',
        'replies.totalCount' => 'repliesCount',
        'comments.totalCount' => 'commentsCount',
        'projects.totalCount' => 'projectsCount',
        'deletedAccountAt' => 'deletedAccountAt'
    ];

    private $sheetHeader = [
        'id',
        'email',
        'username',
        'createdAt',
        'updatedAt',
        'lastLogin',
        'rolesText',
        'enabled',
        'emailConfirmed',
        'locked',
        'phoneConfirmed',
        'phoneConfirmationSentAt',
        'userType.name',
        'consentExternalCommunication',
        'consentInternalCommunication',
        'gender',
        'firstname',
        'lastname',
        'dateOfBirth',
        'websiteUrl',
        'biography',
        'address',
        'address2',
        'zipCode',
        'city',
        'phone',
        'url',
        'googleId',
        'facebookId',
        'samlId',
        'opinionsCount',
        'opinionVotesCount',
        'opinionVersionsCount',
        'arguments.totalCount',
        'argumentVotesCount',
        'proposalsCount',
        'proposalVotesCount',
        'commentVotesCount',
        'sourcesCount',
        'repliesCount',
        'commentsCount',
        'projectsCount',
        'deletedAccountAt'
    ];
    private $toggleManager;

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
        $this->setName('capco:export:users')->setDescription(
            'Create csv file from consultation step data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Feature "export" must be enabled.');

            return;
        }
        $fileName = 'users.csv';

        $requestString = $this->getUsersGraphQLQuery();
        $data = $this->executor
            ->execute('internal', [
                'query' => $requestString,
                'variables' => []
            ])
            ->toArray();

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $header = $this->generateSheetHeader();
        $this->writer->addRow($header);

        $totalCount = Arr::path($data, 'data.users.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'users',
            function ($edge) use ($progress) {
                $progress->advance();
                $user = $edge['node'];
                $this->addUserRow($user);
                //                exit;
            },
            function ($pageInfo) {
                return $this->getUsersGraphQLQuery($pageInfo['endCursor']);
            }
        );

        $this->executeSnapshot($input, $output, $fileName);

        $progress->finish();

        $output->writeln('The export file "' . $fileName . '" has been created.');
    }

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
            $row[] = $val;
        }
        $customQuestions = $this->generateSheetHeaderQuestions();
        if (\count($customQuestions) > 0) {
            $responses = array_map(function ($edge) {
                return $edge['node'];
            }, Arr::path($user, 'responses.edges'));
            foreach ($responses as $response) {
                $value = $this->addCustomResponse($response);
                $cleanValue = Text::cleanNewline($value);

                $row[] = $this->exportUtils->parseCellValue($cleanValue);
            }
        }
        $this->writer->addRow($row);
    }

    private function getUsersGraphQLQuery(?string $userCursor = null): string
    {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        return <<<EOF
{
  users(superAdmin: false, first: 100 ${userCursor}) {
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
        address
        address2
        zipCode
        city
        phone
        url
        googleId
        facebookId
        samlId
        opinionVotesCount
        arguments {
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
        commentVotes {
            totalCount
        }
        sources {
            totalCount
        }
        replies {
            totalCount
        }
        projects {
            totalCount
        }
        opinions {
            totalCount
        }
        comments {
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
                'variables' => []
            ])
            ->toArray();

        return array_map(function (array $edge) {
            return $edge['title'];
        }, $questionsTitles['data']['registrationForm']['questions']);
    }

    private function generateSheetHeader(): array
    {
        return array_merge($this->sheetHeader, $this->generateSheetHeaderQuestions());
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
