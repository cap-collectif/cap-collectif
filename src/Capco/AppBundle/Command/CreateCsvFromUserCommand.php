<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\GraphQL\InfoResolver;
use Capco\AppBundle\Utils\Arr;
use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromUserCommand extends ContainerAwareCommand
{
    protected function configure(): void
    {
        $this
            ->setName('capco:export:user')
            ->setDescription('Create csv file from user data')
            ->addArgument('userId', InputArgument::REQUIRED, 'The ID of the user');
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $userId = $input->getArgument('userId');
        /** @var User $user */
        $user = $this->getContainer()->get('capco.user.repository')->find($userId);

        $datas = $this->requestDatas($userId);
        foreach ($datas as $key => $value) {
            $this->createCsv($userId, $value, $key);
        }

        $archive = $this->getContainer()->get('capco.user_archive.repository')->getLastForUser($user);

        if ($archive) {
            $archive->setReady(true);
            $archive->setPath(trim($this->getZipFilenameForUser($userId)));
            $this->getContainer()->get('doctrine.orm.entity_manager')->flush();
        }

        $output->writeln($this->getZipFilenameForUser($userId));
    }

    protected function requestDatas(string $userId): array
    {
        $executor = $this->getContainer()->get('overblog_graphql.request_executor')->disabledDebugInfo();

        // TODO disable ACL or give admin rights (to disable access)
        $datas['user'] = $executor->execute(
            [
                'query' => $this->getUserGraphQLQuery($userId),
                'variables' => [],
            ],
            ['disable_acl' => true]
        )->toArray();

        $datas['questions'] = $executor->execute(
            [
                'query' => $this->getRepliesGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['medias'] = $executor->execute(
            [
                'query' => $this->getMediasGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['groups'] = $executor->execute(
            [
                'query' => $this->getGroupsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['reports'] = $executor->execute(
            [
                'query' => $this->getReportsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['events'] = $executor->execute(
            [
                'query' => $this->getEventsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['proposals'] = $executor->execute(
            [
                'query' => $this->getProposalsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['opinions'] = $executor->execute(
            [
                'query' => $this->getOpinionGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['opinionsVersion'] = $executor->execute(
            [
                'query' => $this->getOpinionVersionGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['arguments'] = $executor->execute(
            [
                'query' => $this->getArgumentGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['sources'] = $executor->execute(
            [
                'query' => $this->getSourceGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['votes'] = $executor->execute(
            [
                'query' => $this->getVotesGraphQLQuery($userId),
                'variables' => [],
            ],
            ['disable_acl' => true]
        )->toArray();

        return $datas;
    }

    protected function getZipFilenameForUser(string $userId): string
    {
        $hash = sha1($userId . time());

        return "$hash.zip";
    }

    protected function getZipPathForUser(string $userId): string
    {
        return $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/' . $this->getZipFilenameForUser(
                $userId
            );
    }

    protected function createZipArchive(string $zipName, array $files, bool $removeFilesAfter = true, bool $isMedias = false): void
    {
        $zip = new \ZipArchive();

        $zip->open($zipName, \ZipArchive::CREATE);

        if ($isMedias) {
            $zip->addEmptyDir('pictures');
            foreach ($files as $file) {
                foreach ($file as $localName => $path) {
                    $zip->addFile($path, '/pictures/' . $localName);
                }
            }
        } else {
            foreach ($files as $file) {
                foreach ($file as $localName => $path) {
                    $zip->addFile($path, $localName);
                }
            }
        }

        $zip->close();

        if ($removeFilesAfter) {
            foreach ($files as $file) {
                foreach ($file as $localName => $path) {
                    unlink($path);
                }
            }
        }
    }

    protected function createCsv(string $userId, array $data, string $type): void
    {
        $writer = WriterFactory::create(Type::CSV);
        $writer->openToFile($this->getPath());

        if (isset($data['errors'])) {
            var_dump($data['errors']);
            throw new \RuntimeException('Failed to query GraphQL to export userId ' . $userId);
        }
        unset($data['extensions']);

        // set headers row
        $header = $this->getCleanHeadersName($data, $type);
        $writer->addRow($header);

        $rows = [];
        //we need to handle indepth arrays who are not mapped
        if ($contributions = Arr::path($data, 'data.node.contributions.edges')) {
            $rows = $this->getCleanArrayForRowInsert($contributions, $header, true);
        } elseif ($medias = Arr::path($data, 'data.node.medias')) {
            $this->exportMedias($medias, $userId);
            $rows = $this->getCleanArrayForRowInsert($medias, $header);
        } elseif ($groups = Arr::path($data, 'data.node.groups.edges')) {
            $rows = $this->getCleanArrayForRowInsert($groups, $header, true);
        } elseif ($reports = Arr::path($data, 'data.node.reports.edges')) {
            $rows = $this->getCleanArrayForRowInsert($reports, $header, true);
        } elseif ($events = Arr::path($data, 'data.node.events.edges')) {
            $rows = $this->getCleanArrayForRowInsert($events, $header, true);
        } elseif ($votes = Arr::path($data, 'data.node.votes.edges')) {
            $rows = $this->getCleanArrayForRowInsert($votes, $header, true);
        } else {
            foreach ($header as $value) {
                $value = Arr::path($data, "data.node.$value") ?? '';
                $rows[] = $value;
            }
        }

        if (!empty($rows) && \is_array($rows[0])) {
            $writer->addRows($rows);
        } else {
            $writer->addRow($rows);
        }

        $writer->close();

        if ($header) {
            $this->createZipArchive(
                $this->getZipPathForUser($userId),
                [
                    ["$type.csv" => $this->getPath()],
                ]
            );
        }
    }

    protected function getCleanArrayForRowInsert(array $contents, array $header, bool $isNode = false): array
    {
        $rows = [];
        $rowCounter = 0;
        $responsesInserted = false;

        foreach ($contents as $content) {
            foreach ($header as $columnKey => $columnName) {
                if ($isNode) {
                    if (false !== strpos($columnName, 'responses.') && false === $responsesInserted) {
                        $responsesDatas = $this->handleMultipleResponsesForQuestions($content, $rowCounter, $columnKey, $rows);
                        $rows = $responsesDatas['rows'];
                        $rowCounter = $responsesDatas['counter'];
                        $responsesInserted = true;
                    }
                    $cellData = Arr::path($content['node'], $columnName);
                } else {
                    $cellData = Arr::path($content, $columnName);
                }

                if (!\is_array($cellData)) {
                    $rows[$rowCounter][] = false === $cellData ? 0 : $cellData;
                }
            }
            ++$rowCounter;
        }

        return $rows;
    }

    protected function handleMultipleResponsesForQuestions(array $responses, int $rowCounter, int $columnKey, array $rows): array
    {
        //a question can have multiple responses so we insert a line for each response
        $emptyRow = [null, null, null, null, null, null, null];
        foreach ($responses['node']['responses'] as $response) {
            if ($response['question']['title'] && $response['formattedValue']) {
                $rows[$rowCounter][$columnKey] = $response['question']['title'];
                $rows[$rowCounter][$columnKey + 1] = $response['formattedValue'];
                ++$rowCounter;
                $rows[$rowCounter] = $emptyRow;
            }
        }

        return ['rows' => $rows, 'counter' => $rowCounter];
    }

    protected function exportMedias(array $medias, string $userId)
    {
        $mediasPath = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/media/default/0001/01/';

        foreach ($medias as $media) {
            if (isset($media['providerReference'])) {
                $fileToCopy = $mediasPath . $media['providerReference'];

                $this->createZipArchive(
                    $this->getZipPathForUser($userId),
                    [
                        [$media['providerReference'] => $fileToCopy],
                    ],
                    false,
                    true
                );
            }
        }
    }

    protected function getCleanHeadersName($data, string $type): array
    {
        $infoResolver = new InfoResolver();
        $header = array_map(
            function ($item) use ($type) {
                $item = str_replace('data_node_', '', $item);
                if ('show_url' !== $item) {
                    $item = str_replace('_', '.', $item);
                }

                if ('medias' === $type) {
                    $item = str_replace('medias.', '', $item);
                } elseif ('groups' === $type) {
                    $item = str_replace('groups.edges.node.', '', $item);
                } elseif ('reports' === $type) {
                    $item = str_replace('reports.edges.node.', '', $item);
                } elseif ('events' === $type) {
                    $item = str_replace('events.edges.node.', '', $item);
                } elseif ('votes' === $type) {
                    $item = str_replace('votes.edges.node.', '', $item);
                } else {
                    $item = str_replace('contributions.edges.node.', '', $item);
                }

                return $item;
            },
            $infoResolver->guessHeadersFromFields($data)
        );

        return $header;
    }

    protected function getFilename(): string
    {
        return 'data.csv';
    }

    protected function getPath(): string
    {
        return $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/' . $this->getFilename();
    }

    protected function getUserGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      id
      email
      username
      userType {
        name
      }
      createdAt
      updatedAt
      expired
      lastLogin
      rolesText
      consentExternalCommunication
      enabled
      locked
      phoneConfirmed
      phoneConfirmationSentAt
      gender
      firstname
      lastname
      dateOfBirth
      website
      biography
      address
      address2
      neighborhood
      zipCode
      city
      phone
      show_url
      samlId
      googleId
      facebookId
      facebookUrl
      twitterUrl
      linkedInUrl
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
    }
  }
}
EOF;
    }

    protected function getOpinionGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: OPINION) {
        edges {
          node {
            ... on Opinion {
              title
              bodyText
              section {
                title
              }
              createdAt
              updatedAt
              url
              expired
              published
              trashed
              trashedAt
              trashedReason
              votesCount
              votesCountOk
              votesCountMitige
              votesCountNok
              argumentsCount
              argumentsCountFor
              argumentsCountAgainst
              sourcesCount
              versionsCount
            }
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getOpinionVersionGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: OPINIONVERSION) {
        edges {
          node {
            ... on Version {
              title
              bodyText
              related {
                kind
                url
              }
              comment
              createdAt
              updatedAt
              url
              expired
              published
              trashed
              trashedAt
              trashedReason
              votesCount
              votesCountOk
              votesCountMitige
              votesCountNok
              argumentsCount
              argumentsCountFor
              argumentsCountAgainst
              sourcesCount
            }
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getArgumentGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: ARGUMENT) {
        edges {
          node {
            ... on Argument {
              body
              related {
                kind
                url
              }
              type
              createdAt
              updatedAt
              url
              expired
              published
              trashed
              trashedAt
              trashedReason
              votesCount
            }
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getSourceGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: SOURCE) {
        edges {
          node {
            ... on Source {
              related {
                kind
                url
              }
              url
              body
              createdAt
              updatedAt
              expired
              published
              trashed
              trashedAt
              trashedReason
              votesCount
            }
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getVotesGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      votes {
        edges {
          node {
            kind
            related {
              kind
              url
            }
            expired
            createdAt
            private
          }
        }
      }
    }
  }
}

EOF;
    }

    protected function getRepliesGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: REPLY) {
        edges {
          node {
            ... on Reply {
              questionnaire {
                title
              }
              url
              updatedAt
              expired
              responses {
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
        }
      }
    }
  }
}
EOF;
    }

    protected function getMediasGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      medias {
        id
        name
        enabled
        authorName
        description
        contentType
        size 
        url
        providerReference
      }
    }
  }
}

EOF;
    }

    protected function getGroupsGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      groups {
        edges {
          node {
            title
            description
            users {
              totalCount
            }
            createdAt
            updatedAt
          }
        }
      }
    }
  }
}

EOF;
    }

    protected function getReportsGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      reports {
        edges {
          node {
            related {
              kind
            }
            type
            body
            createdAt
          }
        }
      }
    }
  }
}

EOF;
    }

    protected function getEventsGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      events {
        edges {
          node {
            title
            startAt
            endAt
            themes {
              title
            }
            projects {
              title
            }
            commentable
            createdAt
            updatedAt
            body
            link
            address
            zipCode
            city
            country
          }
        }
      }
    }
  }
}

EOF;
    }

    protected function getProposalsGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(type: PROPOSAL) {
        edges {
          node {
            ... on Proposal {
              url
              title
              bodyText              
              formattedAddress
              createdAt
              updatedAt
              expired
              trashedAt
              trashedReason            
            }
          }
        }
      }
    }
  }
}
EOF;
    }
}
