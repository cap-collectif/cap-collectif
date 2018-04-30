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
        $infoResolver = new InfoResolver();
        $writer = WriterFactory::create(Type::CSV);
        $writer->openToFile($this->getPath());

        $data = $executor->disabledDebugInfo()->execute([
            'query' => $this->getUserGraphQLQuery($userId),
            'variables' => [],
        ])->toArray();

        $header = array_map(function ($item) {
            $item = str_replace('data_node_', '', $item);
            if ('show_url' !== $item) {
                $item = str_replace('_', '.', $item);
            }

            return $item;
        }, $infoResolver->guessHeadersFromFields($data));

        $writer->addRow($header);

        $row = [];
        foreach ($header as $value) {
            $row[] = Arr::path($data, "data.node.$value") ?? '';
        }
        $writer->addRow($row);

        $writer->close();

        $output->writeln("<info>Successfully exported data for user $userId</info>");
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
    }
  }
}
EOF;
    }
}
