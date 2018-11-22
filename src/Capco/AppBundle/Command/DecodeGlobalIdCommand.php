<?php

namespace Capco\AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class DecodeGlobalIdCommand extends Command
{
    protected static $defaultName = 'global-id:decode';

    protected function configure()
    {
        $this->setDescription('Get a Global ID.')->addArgument(
            'id',
            InputArgument::REQUIRED,
            'The Global ID'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $id = $input->getArgument('id');

        $output->writeln('<info>' . var_export(GlobalId::fromGlobalId($id)) . '</info>');
    }
}
