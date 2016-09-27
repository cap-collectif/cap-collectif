<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Swarrot\Broker\Message;

class PublishExampleMessageCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:publish-example-message')
            ->setDescription('Test rabbitmq publish')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $publisher = $this->getContainer()->get('swarrot.publisher');
        $publisher->publish('message.example', new Message('salut c cool'));
        $output->writeln('message published');
    }
}
