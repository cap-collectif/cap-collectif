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

        foreach ($datas as $key => $value) {
            $this->createCsv($userId, $value, $key);
        }

        $output->writeln($this->getZipFilenameForUser($userId));
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

    protected function createCsv(string $userId, array $data, string $type)
    {
        $infoResolver = new InfoResolver();
        $writer = WriterFactory::create(Type::CSV);
        $writer->openToFile($this->getPath());

        if (isset($data['errors'])) {
            var_dump($data['errors']);
            throw new \RuntimeException('Failed to query GraphQL to export userId ' . $userId);
        }
        unset($data['extensions']);

        $header = array_map(
            function ($item) use ($type) {
                $item = str_replace('data_node_', '', $item);
                if ('show_url' !== $item) {
                    $item = str_replace('_', '.', $item);
                }
                if ('questions' === $type) {
                    $item = str_replace('contributions.', '', $item);
                }
                if ('medias' === $type) {
                    $item = str_replace('medias.', '', $item);
                }
                if ('groups' === $type) {
                    $item = str_replace('groups.', '', $item);
                }

                return $item;
            },
            $infoResolver->guessHeadersFromFields($data)
        );

        $writer->addRow($header);

        $row = [];
        if ($contributions = Arr::path($data, 'data.node.contributions')) {
            $row = $this->resolveContribution($contributions, $header);
        } elseif ($medias = Arr::path($data, 'data.node.medias')) {
            $row = $this->resolveContribution($medias, $header);
        } elseif ($groups = Arr::path($data, 'data.node.groups')) {
            $row = $this->resolveContribution($groups, $header);
        } else {
            foreach ($header as $value) {
                $value = Arr::path($data, "data.node.$value") ?? '';
                $row[] = $value;
            }
        }
        if (!empty($row) && \is_array($row[0])) {
            $writer->addRows($row);
        } else {
            $writer->addRow($row);
        }
        $writer->close();

        $this->createZipArchive(
            $this->getZipPathForUser($userId),
            [
                ["$type.csv" => $this->getPath()],
            ]
        );
    }

    protected function resolveContribution(array $contributions, array $header)
    {
        $row = [];
        $i = 0;
        foreach ($contributions as $contribution) {
            foreach ($header as $value) {
                if (false === Arr::path($contribution, $value)) {
                    $value = 0;
                } else {
                    $value = Arr::path($contribution, $value);
                }
                $row[$i][] = $value;
            }
            ++$i;
        }

        return $row;
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
      contributions(contributionType: "Opinion") {
        ... on Opinion {
          id
          author {
            id
          }
          section {
            title
          }
          title
          body
          bodyText
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
EOF;
    }

    protected function getOpinionVersionGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(contributionType: "OpinionVersion") {
        ... on Version {
          related {
            id
            kind
          }
          id
          author {
            id
          }
          title
          body
          bodyText
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
EOF;
    }

    protected function getArgumentGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(contributionType: "Argument") {
        ... on Argument {
          related {
            id
            kind
          }
          id
          author {
            id
          }
          type
          body
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
EOF;
    }

    protected function getSourceGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(contributionType: "Source") {
        ... on Source {
          related {
            id
            kind
          }
          id
          author {
            id
          }
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
EOF;
    }

    protected function getVoteGraphQLQuery(string $userId, string $type): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      contributions(contributionType: "Vote") {
        ... on ${$type}Vote {
					id
          author {
            id
          }
          value
          createdAt
          expired
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
      contributions(contributionType: "Replies") {
        ... on Reply {
          questionnaire {
            title
          }
          id
          author {
            id
            email
          }
          updatedAt
          expired
          anonymous
          responses {
            question {
              title
            }
            ... on ValueResponse {
              value
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
}
