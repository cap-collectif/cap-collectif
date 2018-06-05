<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\GraphQL\InfoResolver;
use Capco\AppBundle\Utils\Arr;
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

        $datas = $this->requestDatas($userId);
        foreach ($datas as $key => $value) {
            $this->createCsv($userId, $value, $key);
        }

        $output->writeln($this->getZipFilenameForUser($userId));
    }

    protected function requestDatas(string $userId): array
    {
        $executor = $this->getContainer()->get('overblog_graphql.request_executor');

        // TODO disable ACL or give admin rights (to disable access)
        $datas['user'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getUserGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['questions'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getRepliesGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['medias'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getMediasGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['groups'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getGroupsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['reports'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getReportsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['events'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getEventsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['proposals'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getProposalsGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['opinions'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getOpinionGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['opinionsVersion'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getOpinionVersionGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['arguments'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getArgumentGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['sources'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getSourceGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        $datas['votes'] = $executor->disabledDebugInfo()->execute(
            [
                'query' => $this->getVotesGraphQLQuery($userId),
                'variables' => [],
            ]
        )->toArray();

        return $datas;
    }

    protected function getZipFilenameForUser(string $userId): string
    {
        return "$userId.zip";
    }

    protected function getZipPathForUser(string $userId): string
    {
        return $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/' . $this->getZipFilenameForUser(
                $userId
            );
    }

    protected function createZipArchive(string $zipName, array $files, bool $removeFilesAfter = true): void
    {
        $zip = new \ZipArchive();
        $zip->open($zipName, \ZipArchive::CREATE);
        foreach ($files as $file) {
            foreach ($file as $localName => $path) {
                $zip->addFile($path, $localName);
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
        $infoResolver = new InfoResolver();
        $writer = WriterFactory::create(Type::CSV);
        $writer->openToFile($this->getPath());

        if (isset($data['errors'])) {
            var_dump($data['errors']);
            throw new \RuntimeException('Failed to query GraphQL to export userId ' . $userId);
        }
        unset($data['extensions']);

        $header = $this->resolveHeaders($data, $type);
        $writer->addRow($header);

        $rows = [];
        if ($contributions = Arr::path($data, 'data.node.contributions.edges')) {
            $rows = $this->resolveArray($contributions, $header, true);
        } elseif ($medias = Arr::path($data, 'data.node.medias')) {
            $rows = $this->resolveArray($medias, $header);
        } elseif ($groups = Arr::path($data, 'data.node.groups')) {
            $rows = $this->resolveArray($groups, $header);
        } elseif ($reports = Arr::path($data, 'data.node.reports')) {
            $rows = $this->resolveArray($reports, $header);
        } elseif ($events = Arr::path($data, 'data.node.events')) {
            $rows = $this->resolveArray($events, $header);
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

    protected function resolveArray(array $contents, array $header, bool $isNode = false): array
    {
        $row = [];
        $i = 0;
        $inserted = 0;

        foreach ($contents as $content) {
            foreach ($header as $key => $value) {
                if ($isNode) {
                    if (false !== strpos($value, 'responses.') && 0 === $inserted) {
                        $datas = $this->handleQuestionsResponses($content, $i, $key, $row);
                        $row = $datas['row'];
                        $i = $datas['counter'];
                        $inserted = 1;
                    }
                    $value = Arr::path($content['node'], $value);
                } else {
                    $value = Arr::path($content, $value);
                }
                $row[$i][] = false === $value ? 0 : $value;
            }
            ++$i;
        }

        return $row;
    }

    // Gange
    protected function handleQuestionsResponses(array $responses, int $i, int $key, array $row): array
    {
        foreach ($responses['node']['responses'] as $response) {
            if ($response['question']['title'] && $response['formattedValue']) {
                $row[$i][$key] = $response['question']['title'];
                $row[$i][$key + 1] = $response['formattedValue'];
                ++$i;
                $row[$i] = [null, null, null, null, null, null, null];
            }
        }

        return ['row' => $row, 'counter' => $i];
    }

    protected function resolveHeaders($data, string $type): array
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
                    $item = str_replace('groups.', '', $item);
                } elseif ('reports' === $type) {
                    $item = str_replace('reports.', '', $item);
                } elseif ('events' === $type) {
                    $item = str_replace('events.', '', $item);
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
  node(id: "$userId") {
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
        kind
        related {
          kind
          url
        }
        expired
        createdAt
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
              anonymous
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
        name
        enabled
        authorName
        description
        contentType
        size 
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
        title
        description
        usersCount
        createdAt
        updatedAt
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
  node(id: "$userId") {
    ... on User {
      reports {
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
EOF;
    }

    protected function getEventsGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "$userId") {
    ... on User {
    	events {
        title
        startAt
        endAt
        themes {
          title
        }
        projects {
          title
        }
        published
        commentEnabled
        createdAt
        updatedAt
        body
        registrationEnabled
        link
        address
        zipCode
        city
        country
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
