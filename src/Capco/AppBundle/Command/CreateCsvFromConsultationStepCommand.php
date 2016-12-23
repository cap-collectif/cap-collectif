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
      return $response['data'];
    }

    // public function getVotesQuery(int $id)
    // {
    //   return '{
    //       votesByContribution(contribution: '.$id.') {
    //         value
    //         author {
    //           id
    //         }
    //       }
    //    }';
    // }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $requestString = '{
          contributions(consultation: 1) {
           id
           author {
            id
            type {
              name
            }
           }
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
           versionsCount
           sourcesCount
           arguments {
            id
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
           sources {
            id
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
           reportings {
            id
            author {
             id
             type {
               name
             }
            }
            type
            body
            createdAt
           }
           versions {
             id
             author {
              id
              type {
                name
              }
             }
             title
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
             votesCountOk
             votesCountMitige
             votesCountNok
             argumentsCount
             argumentsCountFor
             argumentsCountAgainst
             versionsCount
             sourcesCount
           }
         }
       }
       ';

        $writer = Writer::createFromPath('web/export/papapo.csv', 'w');
        $writer->setDelimiter(",");
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        (new GraphQLToCsv())
          ->generate(
            $requestString,
            $this->queryGraphql($requestString),
            $writer
        );
}
