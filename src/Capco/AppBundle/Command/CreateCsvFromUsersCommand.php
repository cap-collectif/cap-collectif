<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\GraphQL\GraphQLToCsv;
use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use League\Csv\Writer;

class CreateCsvFromUsersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:users')
            ->setDescription('Create csv file from consultation step data');
    }

    private function getUsersGraphQLQuery(): string
    {
        return '
{
    users (superAdmin: false) {
        id
        email
        username
        createdAt
        updatedAt
        lastLogin
        userType
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
        profileUrl
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
        ideasCount
        ideaVotesCount
        ideaCommentsCount
        postCommentsCount
        eventCommentsCount
        projectsCount
    }
}           
        ';
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $csvGenerator = new GraphQLToCsv();
        $fileName = 'users_'.EnvHelper::get('SYMFONY_INSTANCE_NAME').'.csv';
        $writer = Writer::createFromPath('web/export/'.$fileName, 'w');
        $writer->setDelimiter(',');
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $requestString = $this->getUsersGraphQLQuery();
        $csvGenerator->generate(
            $requestString,
            $this->getContainer()->get('overblog_graphql.request_executor'),
            $writer
        );
        $output->writeln('The export file "'.$fileName.'" has been created.');
    }

}
