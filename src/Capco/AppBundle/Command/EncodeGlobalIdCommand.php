<?php

namespace Capco\AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class EncodeGlobalIdCommand extends Command
{
    protected static $defaultName = 'global-id:encode';

    protected function configure()
    {
        $this->setDescription('Get a Global ID.')
            ->addArgument('type', InputArgument::REQUIRED, 'The type')
            ->addArgument('id', InputArgument::REQUIRED, 'The ID');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $availableTypes = ['Questionnaire', 'User', 'Consultation', 'Event'];
        $type = $input->getArgument('type');
        if (!in_array($type, $availableTypes)) {
            $output->writeln('Unknown type : ' . $type);
        }

        $id = $input->getArgument('id');

        $output->writeln('<info>' . GlobalId::toGlobalId($type, $id) . '</info>');
    }
}
