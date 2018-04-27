<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\GraphQL\GraphQLToCsv;
use League\Csv\Writer;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromUsersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:users')
            ->setDescription('Create csv file from consultation step data');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        if (!$container->get('capco.toggle.manager')->isActive('export')) {
            return;
        }
        $csvGenerator = new GraphQLToCsv($container->get('logger'));
        $fileName = 'users.csv';
        $writer = Writer::createFromPath($container->getParameter('kernel.root_dir') . '/../web/export/' . $fileName, 'w');
        $writer->setDelimiter(',');
        $writer->setNewline("\r\n");
        $writer->setOutputBOM(Writer::BOM_UTF8);
        $requestString = $this->getUsersGraphQLQuery();
        $csvGenerator->generate(
            $requestString,
            $container->get('overblog_graphql.request_executor'),
            $writer
        );
        $output->writeln('The export file "' . $fileName . '" has been created.');
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
        rolesText
        enabled
        locked
        expired
        phoneConfirmed
        phoneConfirmationSentAt
        userType { name }
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
    }
}
        ';
    }
}
