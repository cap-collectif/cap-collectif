<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Query;
use League\Csv\Writer;
use Symfony\Component\Console\Helper\ProgressBar;
use Capco\AppBundle\GraphQL\GraphQLToCsv;

class CreateCsvFromConsultationStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:consultation')
            ->setDescription('Create csv file from consultation step data');
    }

    public function queryGraphql(string $query)
    {
      $client = new Client(['base_url' => 'http://capco.dev']);
      $request = $client->createRequest(
          'GET',
          '/graphql/',
          [
            'query' => [ 'query' => $query ],
            'headers' => [
              'CONTENT_TYPE' => 'application/graphql'
            ],
          ]
      );
      $urlQuery = $request->getQuery();
      $urlQuery->setEncodingType(Query::RFC1738);
      $request->setQuery($urlQuery);
      $response = $client->send($request);
      $response = $response->json();
      dump($response);
      return $response['data'];
    }

    private function getVotesGraphQLqueryByContributionId(int $id)
    {
      return '{
          votesByContribution(contribution: '.$id.') {
            value
            author {
              id
            }
          }
       }';
    }

    private function getContributionsGraphQLqueryByConsultationStep($constulationStep)
    {
      return '
fragment trashableInfos on TrashableContribution {
  trashed
  trashedAt
  trashedReason
}
fragment authorInfos on ContributionWithAuthor {
  author {
    id
    type {
      name
    }
  }
}
fragment reportInfos on Reporting {
  id
  ...authorInfos
  type
  body
  createdAt
}
fragment argumentInfos on Argument {
  id
  type
  body
  createdAt
  updatedAt
  url
  expired
  published
  ...trashableInfos
  votesCount
}
fragment sourceInfos on Source {
  id
  body
  createdAt
  updatedAt
  expired
  published
  ...trashableInfos
  votesCount
}
{
  contributions(consultation:'. $constulationStep->getId(). ') {
    id
  	...authorInfos
    section {
      title
    }
    title
    body
    createdAt
    updatedAt
    url
    expired
    published
  	...trashableInfos
    votesCount
    votesCountOk
    votesCountMitige
    votesCountNok
    argumentsCount
    argumentsCountFor
    argumentsCountAgainst
    sourcesCount
    versionsCount
    arguments {
  		...argumentInfos
    }
    sources {
  		...sourceInfos
    }
    reportings {
  		...reportInfos
    }
    versions {
      id
  		...authorInfos
      title
      body
      createdAt
      updatedAt
      url
      expired
      published
  		...trashableInfos
      votesCount
      votesCountOk
      votesCountMitige
      votesCountNok
      argumentsCount
      argumentsCountFor
      argumentsCountAgainst
      sourcesCount
      arguments {
  			...argumentInfos
      }
      sources {
  			...sourceInfos
      }
      reportings {
  			...reportInfos
      }
   }
   votes {
      ...authorInfos
      createdAt
      expired
   }
 }
}';
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $steps = $this->getContainer()
            ->get('doctrine')
            ->getRepository('CapcoAppBundle:Steps\ConsultationStep')
            ->findAll();
        $generator = new GraphQLToCsv();

        foreach ($steps as $step) {
            $requestString = $this->getContributionsGraphQLqueryByConsultationStep($step);
            $fileName = $step->getProject()->getSlug().'_'.$step->getSlug().'.csv';
            $writer = Writer::createFromPath('web/export/'.$fileName, 'w');
            $writer->setDelimiter(",");
            $writer->setNewline("\r\n");
            $writer->setOutputBOM(Writer::BOM_UTF8);
            $generator->generate(
                $requestString,
                $this->queryGraphql($requestString),
                $writer
            );
            $output->writeln('The export file "'.$fileName.'" has been created.');
        }
    }
}
