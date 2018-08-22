<?php
namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\GraphQL\GraphQLToCsv;
use Capco\AppBundle\GraphQL\InfoResolver;
use Capco\AppBundle\Utils\Arr;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Request\Executor;
use League\Csv\Writer;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromUsersCommand extends ContainerAwareCommand
{
    protected $connectionTraversor;
    protected $listener;
    protected $executor;
    protected $projectRootDir;

    /**
     * @var WriterInterface
     */
    protected $writer;

    protected const SHEET_HEADER = [
        'id',
        'email',
        'username',
        'createdAt',
        'updatedAt',
        'lastLogin',
        'rolesText',
        'enabled',
        'locked',
        'phoneConfirmed',
        'phoneConfirmationSentAt',
        'userType.name',
        'consentExternalCommunication',
        'gender',
        'firstname',
        'lastname',
        'dateOfBirth',
        'website',
        'biography',
        'address',
        'address2',
        'zipCode',
        'city',
        'phone',
        'show_url',
        'googleId',
        'facebookId',
        'samlId',
        'opinionsCount',
        'opinionVotesCount',
        'opinionVersionsCount',
        'argumentsCount',
        'argumentVotesCount',
        'proposalsCount',
        'proposalVotesCount',
        'commentVotesCount',
        'sourcesCount',
        'repliesCount',
        'postCommentsCount',
        'eventCommentsCount',
        'projectsCount',
        'deletedAccountAt',
    ];

    protected $contributionHeaderMap = [
        'id' => 'id',
        'email' => 'email',
        'username' => 'username',
        'createdAt' => 'createdAt',
        'updatedAt' => 'updatedAt',
        'lastLogin' => 'lastLogin',
        'rolesText' => 'rolesText',
        'enabled' => 'enabled',
        'locked' => 'locked',
        'phoneConfirmed' => 'phoneConfirmed',
        'phoneConfirmationSentAt' => 'phoneConfirmationSentAt',
        'userType.name' => 'userType.name',
        'consentExternalCommunication' => 'consentExternalCommunication',
        'gender' => 'gender',
        'firstname' => 'firstname',
        'lastname' => 'lastname',
        'dateOfBirth' => 'dateOfBirth',
        'website' => 'website',
        'biography' => 'biography',
        'address' => 'address',
        'address2' => 'address2',
        'zipCode' => 'zipCode',
        'city' => 'city',
        'phone' => 'phone',
        'show_url' => 'show_url',
        'googleId' => 'googleId',
        'facebookId' => 'facebookId',
        'samlId' => 'samlId',
        'opinionsCount' => 'opinionsCount',
        'opinionVotesCount' => 'opinionVotesCount',
        'opinionVersionsCount' => 'opinionVersionsCount',
        'argumentsCount' => 'argumentsCount',
        'argumentVotesCount' => 'argumentVotesCount',
        'proposalsCount' => 'proposalsCount',
        'proposalVotesCount' => 'proposalVotesCount',
        'commentVotesCount' => 'commentVotesCount',
        'sourcesCount' => 'sourcesCount',
        'repliesCount' => 'repliesCount',
        'postCommentsCount' => 'postCommentsCount',
        'eventCommentsCount' => 'eventCommentsCount',
        'projectsCount' => 'projectsCount',
        'deletedAccountAt' => 'deletedAccountAt',
    ];

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:export:users')->setDescription(
            'Create csv file from consultation step data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        if (!$container->get('capco.toggle.manager')->isActive('export')) {
            return;
        }
        $fileName = 'users.csv';

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $this->writer->addRow(self::SHEET_HEADER);

        $requestString = $this->getUsersGraphQLQuery(null);
        $users = $this->executor->execute(null, [
            'query' => $requestString,
            'variables' => [],
        ])->toArray();

        $totalCount = Arr::path($users, 'data.users.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $users,
            'data.users',
            function ($edge) use ($progress) {
                $progress->advance();
                $user = $edge['node'];
                $this->addUserRow($user);
            },
            function ($pageInfo) {
                return $this->getUsersGraphQLQuery($pageInfo['endCursor']);
            }
        );

        $progress->finish();

        $output->writeln('The export file "' . $fileName . '" has been created.');
    }

    private function addUserRow($user): void
    {
        $row = [];
        foreach ($this->contributionHeaderMap as $path => $columnName) {
            $row[] = isset($this->contributionHeaderMap[$path])
                ? $this->parseCellValue(Arr::path($user, $this->contributionHeaderMap[$path]))
                : '';
        }
        $this->writer->addRow($row);
    }

    protected function parseCellValue($value)
    {
        if (!\is_array($value)) {
            if (\is_bool($value)) {
                return true === $value ? 'Yes' : 'No';
            }

            return $value;
        }

        return $value;
    }

    private function getUsersGraphQLQuery(?string $userAfter = null): string
    {
        if ($userAfter) {
            $userAfter = sprintf(', after: "%s"', $userAfter);
        }

        return <<<EOF
{
  users(superAdmin: false, first: 100 $userAfter) {
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
        locked
        phoneConfirmed
        phoneConfirmationSentAt
        userType {
          name
        }
        consentExternalCommunication
        gender
        firstname
        lastname
        dateOfBirth
        website
        biography
        address
        address2
        zipCode
        city
        phone
        show_url
        googleId
        facebookId
        samlId
        opinionsCount
        opinionVotesCount
        opinionVersionsCount
        argumentsCount
        argumentVotesCount
        proposalsCount
        proposalVotesCount
        commentVotesCount
        sourcesCount
        repliesCount
        postCommentsCount
        eventCommentsCount
        projectsCount
        deletedAccountAt
      }
    }
  }
}
EOF;
    }
}
